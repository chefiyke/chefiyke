import PaymentTypes "../types/payment";
import RolesTypes "../types/roles";
import AuditTypes "../types/audit";
import SecurityTypes "../types/security";
import PaymentLib "../lib/payment";
import RolesLib "../lib/roles";
import AuditLib "../lib/audit";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";

// SECURITY NOTE: Full HMAC-SHA256 not implemented in-canister.
// Secret hash equality check provides defense-in-depth.
// Enable by calling adminSetWebhookSecretHash with the hash of your webhook secret.

mixin (
  paymentOrders : List.List<PaymentTypes.PaymentOrder>,
  nextPaymentOrderId : { var value : Nat },
  paymentConfig : { var value : PaymentTypes.PaymentConfig },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
  rateLimits : Map.Map<Text, SecurityTypes.RateLimitEntry>,
  blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
  auditLogs : List.List<AuditTypes.AuditLog>,
  nextAuditLogId : { var value : Nat },
  webhookSecretHash : { var value : Text },
) {
  // ── Rate-limit helper ─────────────────────────────────────────────────────────

  func checkRateLimit(key : Text, maxPerMin : Nat) : Bool {
    let now = Time.now();
    let windowNs : Int = 60_000_000_000; // 1 minute in nanoseconds
    let cutoff : Int = now - windowNs;
    switch (rateLimits.get(key)) {
      case null {
        rateLimits.add(key, { var timestamps = [now] });
        true
      };
      case (?entry) {
        let recent = entry.timestamps.filter(func(t : Int) : Bool { t > cutoff });
        if (recent.size() >= maxPerMin) {
          entry.timestamps := recent;
          false
        } else {
          entry.timestamps := recent.concat([now]);
          true
        }
      };
    }
  };

  // ── Webhook signature validation helper ──────────────────────────────────────
  // Defense-in-depth checks:
  //   1. Signature must be non-empty (already checked at call site)
  //   2. Signature must be >= 32 chars
  //   3. Signature must be hex-format (only 0-9, a-f, A-F chars)
  //   4. If webhookSecretHash is set, signature must match exactly

  func isHexChar(c : Char) : Bool {
    (c >= '0' and c <= '9') or (c >= 'a' and c <= 'f') or (c >= 'A' and c <= 'F')
  };

  func validateWebhookSignature(
    caller : Principal,
    provider : Text,
    signature : Text,
  ) : { #ok; #err : Text } {
    // Check 1: minimum length
    if (signature.size() < 32) {
      return #err("Invalid signature: too short")
    };
    // Check 2: hex format only — reject non-hex signatures
    var hexValid = true;
    for (c in signature.toIter()) {
      if (not isHexChar(c)) { hexValid := false }
    };
    if (not hexValid) {
      return #err("Invalid signature: not hex format")
    };
    // Log the webhook receipt — only first 8 chars of signature for audit safety
    let sigPreview = Text.fromIter(signature.toIter().take(8));
    let callerRole = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    // Check 3: if secret hash is configured, enforce equality check
    let secretHash = webhookSecretHash.value;
    if (secretHash.size() > 0) {
      if (signature != secretHash) {
        AuditLib.recordAuditLog(
          auditLogs,
          nextAuditLogId,
          caller,
          callerRole,
          #AccessDenied,
          "Webhook:" # provider,
          "Webhook rejected: signature mismatch. Caller=" # caller.toText() # " SigPrefix=" # sigPreview,
          null,
        );
        return #err("Webhook signature verification failed")
      }
    } else {
      // Log warning: no secret configured — webhook accepted without verification
      AuditLib.recordAuditLog(
        auditLogs,
        nextAuditLogId,
        caller,
        callerRole,
        #Approve,
        "Webhook:" # provider,
        "WARNING: Webhook accepted without secret verification. Caller=" # caller.toText() # " SigPrefix=" # sigPreview,
        null,
      )
    };
    AuditLib.recordAuditLog(
      auditLogs,
      nextAuditLogId,
      caller,
      callerRole,
      #Approve,
      "Webhook:" # provider,
      "Webhook received. Caller=" # caller.toText() # " SigPrefix=" # sigPreview,
      null,
    );
    #ok
  };

  // ── Public: create a payment order ────────────────────────────────────────────

  public shared ({ caller }) func createPaymentOrder(
    payerName : Text,
    payerEmail : Text,
    payerPhone : ?Text,
    method : { #localBank; #paystack; #flutterwave },
  ) : async { #ok : PaymentTypes.PaymentOrder; #err : Text } {
    // Rate limit: max 3 orders per minute per principal
    let key = caller.toText();
    if (blockedKeys.get(key) != null) {
      return #err("Access denied")
    };
    if (not checkRateLimit(key # ":order", 3)) {
      return #err("Too many requests. Please wait before trying again.")
    };
    // Validate method is enabled
    let cfg = paymentConfig.value;
    let isEnabled = cfg.enabledMethods.find(func(m : { #localBank; #paystack; #flutterwave }) : Bool {
      switch (m, method) {
        case (#localBank, #localBank) { true };
        case (#paystack, #paystack) { true };
        case (#flutterwave, #flutterwave) { true };
        case _ { false };
      }
    }) != null;
    if (not isEnabled) {
      return #err("Payment method not available")
    };
    if (payerName.size() == 0 or payerEmail.size() == 0) {
      return #err("Name and email are required")
    };
    let order = PaymentLib.createPaymentOrder(
      paymentOrders,
      nextPaymentOrderId,
      payerName,
      payerEmail,
      payerPhone,
      method,
      cfg.servicePriceNgn,
      cfg.defaultCurrency,
    );
    #ok(order)
  };

  // ── Webhook: receive gateway confirmation (Paystack) ──────────────────────────
  // Signature header must be present and valid.
  // Defense-in-depth: format check + optional secret hash equality check.

  public shared ({ caller }) func paystackWebhook(
    body : Text,
    signature : Text,
  ) : async { #ok : Text; #err : Text } {
    if (signature.size() == 0) {
      return #err("Unauthorized")
    };
    switch (validateWebhookSignature(caller, "paystack", signature)) {
      case (#err(e)) { return #err(e) };
      case (#ok) {};
    };
    let orderId = extractOrderIdFromBody(body);
    switch orderId {
      case null { #err("Invalid request") };
      case (?oid) {
        PaymentLib.processWebhook(
          paymentOrders,
          activityLog,
          nextLogId,
          oid,
          signature,
          #Completed,
          paymentConfig,
          #paystack,
        )
      };
    }
  };

  // ── Webhook: receive gateway confirmation (Flutterwave) ───────────────────────

  public shared ({ caller }) func flutterwaveWebhook(
    body : Text,
    signature : Text,
  ) : async { #ok : Text; #err : Text } {
    if (signature.size() == 0) {
      return #err("Unauthorized")
    };
    switch (validateWebhookSignature(caller, "flutterwave", signature)) {
      case (#err(e)) { return #err(e) };
      case (#ok) {};
    };
    let orderId = extractOrderIdFromBody(body);
    switch orderId {
      case null { #err("Invalid request") };
      case (?oid) {
        PaymentLib.processWebhook(
          paymentOrders,
          activityLog,
          nextLogId,
          oid,
          signature,
          #Completed,
          paymentConfig,
          #flutterwave,
        )
      };
    }
  };

  // ── Admin: set webhook secret hash ────────────────────────────────────────────
  // Store the hash of your webhook secret here (not the secret itself).
  // When set, all incoming webhooks must present a signature matching this hash exactly.
  // Requires CanManagePayments permission.

  public shared ({ caller }) func adminSetWebhookSecretHash(
    provider : Text,
    secretHash : Text,
  ) : async { #ok : Text; #err : Text } {
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    if (secretHash.size() < 32) {
      return #err("Invalid request: hash too short")
    };
    webhookSecretHash.value := secretHash;
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    AuditLib.recordAuditLog(
      auditLogs,
      nextAuditLogId,
      caller,
      role,
      #Update,
      "WebhookSecretHash:" # provider,
      "Webhook secret hash updated by admin",
      null,
    );
    #ok("Webhook secret hash updated")
  };

  // ── Admin: list all payment orders ────────────────────────────────────────────

  public shared ({ caller }) func adminListPaymentOrders() : async [PaymentTypes.PaymentOrder] {
    PaymentLib.adminListOrders(paymentOrders, roleUsers, caller)
  };

  // ── Admin: manually approve or reject a payment order ─────────────────────────

  public shared ({ caller }) func adminApprovePaymentOrder(
    orderId : Nat,
    approve : Bool,
    notes : ?Text,
  ) : async { #ok : Text; #err : Text } {
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    // Bank transfer approvals require PlatformOwner
    let order = paymentOrders.find(func(o : PaymentTypes.PaymentOrder) : Bool { o.orderId == orderId });
    switch order {
      case null { return #err("Order not found") };
      case (?o) {
        switch (o.method) {
          case (#localBank) {
            let callerRole = RolesLib.getRole(roleUsers, caller);
            switch callerRole {
              case (?(#PlatformOwner)) {};
              case _ { return #err("Unauthorized") };
            };
          };
          case _ {};
        };
      };
    };
    PaymentLib.adminApproveOrder(
      paymentOrders,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      orderId,
      approve,
      notes,
    )
  };

  // ── Private: extract orderId integer from webhook body text ───────────────────
  // Looks for the numeric value after the first occurrence of "orderId"

  func extractOrderIdFromBody(body : Text) : ?Nat {
    let marker = "orderId";
    let parts = body.split(#text marker);
    // discard everything before marker
    switch (parts.next()) {
      case null { return null };
      case (?_) {};
    };
    // afterKey is the portion after "orderId"
    switch (parts.next()) {
      case null { return null };
      case (?afterKey) {
        // collect leading digit run from afterKey
        var digits = "";
        var done = false;
        for (c in afterKey.toIter()) {
          if (not done) {
            if (c >= '0' and c <= '9') {
              digits := digits # Text.fromChar(c);
            } else if (digits.size() > 0) {
              done := true;
            }
          }
        };
        if (digits.size() == 0) { null } else { digits.toNat() }
      };
    }
  };
};
