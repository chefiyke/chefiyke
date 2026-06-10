import PaymentTypes "../types/payment";
import RolesTypes "../types/roles";
import RolesLib "roles";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

module {
  // ── Get public-safe payment config (no secret keys) ──────────────────────────

  public func getPaymentConfigPublic(
    config : { var value : PaymentTypes.PaymentConfig }
  ) : PaymentTypes.PaymentConfigPublic {
    let cfg = config.value;
    {
      enabledMethods = cfg.enabledMethods;
      localBank = cfg.localBank;
      paystackPublicKey = switch (cfg.paystack) {
        case (?ps) { ?ps.publicKey };
        case null { null };
      };
      flutterwavePublicKey = switch (cfg.flutterwave) {
        case (?fw) { ?fw.publicKey };
        case null { null };
      };
      defaultCurrency = cfg.defaultCurrency;
      servicePriceNgn = cfg.servicePriceNgn;
    }
  };

  // ── Admin: set full payment config (with secrets) ────────────────────────────

  public func adminSetPaymentConfig(
    config : { var value : PaymentTypes.PaymentConfig },
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    payload : PaymentTypes.PaymentConfig,
  ) : { #ok : Text; #err : Text } {
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    config.value := { payload with updatedAt = Time.now() };
    RolesLib.logActivity(
      activityLog,
      nextLogId,
      caller,
      role,
      "AdminSetPaymentConfig",
      "PaymentConfig",
      Time.now(),
    );
    #ok("Payment configuration updated successfully")
  };

  // ── Admin: get full payment config (includes secrets) ────────────────────────

  public func adminGetPaymentConfig(
    config : { var value : PaymentTypes.PaymentConfig },
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    caller : Principal,
  ) : PaymentTypes.PaymentConfig {
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    config.value
  };

  // ── Create a new payment order ────────────────────────────────────────────────

  public func createPaymentOrder(
    orders : List.List<PaymentTypes.PaymentOrder>,
    nextOrderId : { var value : Nat },
    payerName : Text,
    payerEmail : Text,
    payerPhone : ?Text,
    method : { #localBank; #paystack; #flutterwave },
    amount : Nat,
    currency : Text,
  ) : PaymentTypes.PaymentOrder {
    let orderId = nextOrderId.value;
    nextOrderId.value += 1;
    let now = Time.now();
    let order : PaymentTypes.PaymentOrder = {
      orderId;
      amount;
      currency;
      method;
      payerEmail;
      payerName;
      payerPhone;
      webhookRef = null;
      status = #Pending;
      createdAt = now;
      updatedAt = now;
      approvedBy = null;
      notes = null;
    };
    orders.add(order);
    order
  };

  // ── Webhook: update order status after gateway confirms ──────────────────────
  // Signature validation is performed by the caller (mixin layer) before calling this.

  public func processWebhook(
    orders : List.List<PaymentTypes.PaymentOrder>,
    _activityLog : List.List<RolesTypes.ActivityLog>,
    _nextLogId : { var value : Nat },
    orderId : Nat,
    webhookRef : Text,
    newStatus : PaymentTypes.PaymentOrderStatus,
    config : { var value : PaymentTypes.PaymentConfig },
    method : { #paystack; #flutterwave },
  ) : { #ok : Text; #err : Text } {
    // Verify the method is configured (confirms gateway secret exists backend-only)
    let _secret : Text = switch method {
      case (#paystack) {
        switch (config.value.paystack) {
          case (?ps) { ps.webhookSecret };
          case null { return #err("Paystack not configured") };
        }
      };
      case (#flutterwave) {
        switch (config.value.flutterwave) {
          case (?fw) { fw.webhookSecret };
          case null { return #err("Flutterwave not configured") };
        }
      };
    };
    // Find and update the order
    var found = false;
    orders.mapInPlace(func(o : PaymentTypes.PaymentOrder) : PaymentTypes.PaymentOrder {
      if (o.orderId == orderId) {
        found := true;
        { o with webhookRef = ?webhookRef; status = newStatus; updatedAt = Time.now() }
      } else {
        o
      }
    });
    if (not found) {
      return #err("Order not found: " # orderId.toText())
    };
    #ok("Order " # orderId.toText() # " updated via webhook")
  };

  // ── Admin: manually approve or reject a payment order ────────────────────────

  public func adminApproveOrder(
    orders : List.List<PaymentTypes.PaymentOrder>,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    orderId : Nat,
    approve : Bool,
    notes : ?Text,
  ) : { #ok : Text; #err : Text } {
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    // PlatformOwner-only for bank transfer approvals — checked in mixin
    var found = false;
    orders.mapInPlace(func(o : PaymentTypes.PaymentOrder) : PaymentTypes.PaymentOrder {
      if (o.orderId == orderId) {
        found := true;
        let newStatus : PaymentTypes.PaymentOrderStatus = if (approve) { #Completed } else { #Rejected };
        { o with status = newStatus; approvedBy = ?caller; notes; updatedAt = Time.now() }
      } else {
        o
      }
    });
    if (not found) {
      return #err("Order not found: " # orderId.toText())
    };
    let action = if (approve) { "AdminApproveOrder" } else { "AdminRejectOrder" };
    RolesLib.logActivity(
      activityLog,
      nextLogId,
      caller,
      role,
      action,
      "PaymentOrder:" # orderId.toText(),
      Time.now(),
    );
    #ok("Order " # orderId.toText() # " " # (if (approve) { "approved" } else { "rejected" }))
  };

  // ── List orders (admin) ───────────────────────────────────────────────────────

  public func adminListOrders(
    orders : List.List<PaymentTypes.PaymentOrder>,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    caller : Principal,
  ) : [PaymentTypes.PaymentOrder] {
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    orders.toArray()
  };
};
