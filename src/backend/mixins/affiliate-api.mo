import AffiliateTypes "../types/affiliate";
import RolesTypes "../types/roles";
import AuditTypes "../types/audit";
import AffiliateLib "../lib/affiliate";
import RolesLib "../lib/roles";
import AuditLib "../lib/audit";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

// Affiliate portal API.
// affiliateGetProfile and affiliateGetInviteLink require the caller to be a
// registered affiliate.
// Admin affiliate management requires CanManageAffiliates (RBAC).
mixin (
  affiliates : Map.Map<Principal, AffiliateTypes.AffiliateProfile>,
  nextAffiliateId : { var value : Nat },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
  clicks : List.List<AffiliateTypes.ClickEvent>,
  conversions : List.List<AffiliateTypes.ConversionEvent>,
  payouts : List.List<AffiliateTypes.PayoutRecord>,
  leadRefs : Map.Map<Text, Nat>,
  commissionSettings : { var value : AffiliateTypes.CommissionSettings },
  nextPayoutId : { var value : Nat },
  affiliateRateLimits : Map.Map<Text, { var timestamps : [Int] }>,
  auditLogs : List.List<AuditTypes.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  // ── Internal helpers ────────────────────────────────────────────────────────

  func callerRole(caller : Principal) : RolesTypes.UserRole {
    switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    }
  };

  func requireAffiliate(caller : Principal) : AffiliateTypes.AffiliateProfile {
    switch (AffiliateLib.getProfile(affiliates, caller)) {
      case null { Runtime.trap("Not a registered affiliate") };
      case (?p) {
        if (p.status != #approved) {
          Runtime.trap("Affiliate account not approved")
        };
        p
      };
    }
  };

  // ── Rate limit helper for affiliate click tracking ───────────────────────────
  // Returns true if the request is allowed, false if rate limited.

  func checkAffiliateClickRateLimit(key : Text, maxPerMin : Nat) : Bool {
    let now = Time.now();
    let windowNs : Int = 60_000_000_000;
    let cutoff : Int = now - windowNs;
    switch (affiliateRateLimits.get(key)) {
      case null {
        affiliateRateLimits.add(key, { var timestamps = [now] });
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

  // ── Affiliate self-service ──────────────────────────────────────────────────

  // Returns the caller's affiliate profile (traps if not registered)
  public shared ({ caller }) func affiliateGetProfile() : async AffiliateTypes.AffiliateProfile {
    switch (AffiliateLib.getProfile(affiliates, caller)) {
      case (?profile) { profile };
      case null { Runtime.trap("Not a registered affiliate") };
    }
  };

  // Returns the referral code stored on the caller's affiliate profile.
  public shared ({ caller }) func affiliateGetInviteLink() : async Text {
    let profile = requireAffiliate(caller);
    profile.referralCode
  };

  // Returns stats for the calling affiliate
  public shared ({ caller }) func affiliateGetStats() : async AffiliateTypes.AffiliateStats {
    let profile = requireAffiliate(caller);
    AffiliateLib.getAffiliateStats(clicks, leadRefs, conversions, payouts, profile.referralCode)
  };

  // Returns payout history for the calling affiliate
  public shared ({ caller }) func affiliateGetPayoutHistory() : async [AffiliateTypes.PayoutRecord] {
    let profile = requireAffiliate(caller);
    AffiliateLib.getPayoutHistory(payouts, profile.referralCode)
  };

  // Affiliate requests a payout for pending commission
  public shared ({ caller }) func affiliateRequestPayout(method : Text) : async { #ok : Text; #err : Text } {
    let profile = requireAffiliate(caller);
    let stats = AffiliateLib.getAffiliateStats(clicks, leadRefs, conversions, payouts, profile.referralCode);
    if (stats.pendingPayout <= 0.0) {
      return #err("No pending commission to withdraw")
    };
    let id = "payout-" # debug_show(nextPayoutId.value);
    nextPayoutId.value += 1;
    let now = Time.now();
    AffiliateLib.addPayoutRecord(payouts, {
      id;
      affiliateId = profile.referralCode;
      amount = stats.pendingPayout;
      method;
      status = #pending;
      requestedAt = now;
      processedAt = null;
      adjustedBy = null;
      adjustmentNote = "";
    });
    #ok(id)
  };

  // ── Public: click tracking (rate-limited, no auth required) ─────────────────
  // Rate limit: all unauthenticated calls share a single "anon-clicks" bucket
  // capped at 20 per minute total. This prevents bulk metric inflation.
  // Silently returns on rate limit — prevents timing-attack confirmation.

  public func trackReferralClick(affiliateId : Text, source : Text) : async () {
    let now = Time.now();
    // All unauthenticated callers share a single rate-limit bucket
    let allowed = checkAffiliateClickRateLimit("anon-clicks", 20);
    if (not allowed) {
      // Silently drop — do not return error to avoid timing-attack confirmation
      AuditLib.recordAuditLog(
        auditLogs,
        nextAuditLogId,
        Principal.anonymous(),
        #Customer,
        #AccessDenied,
        "trackReferralClick",
        "Rate limit exceeded for affiliate click tracking",
        null,
      );
      return
    };
    AffiliateLib.recordClick(clicks, affiliateId, "web", source, now)
  };

  // ── Admin: affiliate registration & approval ────────────────────────────────

  // Admin registers a new affiliate with a given invite code and display name.
  public shared ({ caller }) func adminRegisterAffiliate(
    affiliatePrincipal : Principal,
    inviteCode : Text,
    name : Text,
    email : Text,
  ) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    let refCode = "ref-" # debug_show(nextAffiliateId.value);
    nextAffiliateId.value += 1;
    AffiliateLib.register(affiliates, affiliatePrincipal, inviteCode, name, email, refCode, Time.now());
    RolesLib.logActivity(activityLog, nextLogId, caller, callerRole(caller), "adminRegisterAffiliate", affiliatePrincipal.toText(), Time.now())
  };

  public shared ({ caller }) func adminApproveAffiliate(
    affiliatePrincipal : Principal
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    let result = AffiliateLib.approveAffiliate(affiliates, affiliatePrincipal);
    RolesLib.logActivity(activityLog, nextLogId, caller, callerRole(caller), "adminApproveAffiliate", affiliatePrincipal.toText(), Time.now());
    result
  };

  public shared ({ caller }) func adminRejectAffiliate(
    affiliatePrincipal : Principal,
    reason : Text,
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    let result = AffiliateLib.rejectAffiliate(affiliates, affiliatePrincipal, reason);
    RolesLib.logActivity(activityLog, nextLogId, caller, callerRole(caller), "adminRejectAffiliate", affiliatePrincipal.toText(), Time.now());
    result
  };

  public shared ({ caller }) func adminDisableAffiliate(
    affiliatePrincipal : Principal
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    let result = AffiliateLib.disableAffiliate(affiliates, affiliatePrincipal);
    RolesLib.logActivity(activityLog, nextLogId, caller, callerRole(caller), "adminDisableAffiliate", affiliatePrincipal.toText(), Time.now());
    result
  };

  // Admin can list all registered affiliates.
  public shared ({ caller }) func adminGetAffiliates() : async [AffiliateTypes.AffiliateProfile] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    affiliates.entries().map(func((_, profile)) { profile }).toArray()
  };

  // ── Admin: commission settings ───────────────────────────────────────────────

  public shared ({ caller }) func adminSetCommission(
    settings : AffiliateTypes.CommissionSettings
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    AffiliateLib.setCommissionSettings(commissionSettings, settings);
    RolesLib.logActivity(activityLog, nextLogId, caller, callerRole(caller), "adminSetCommission", "global", Time.now());
    #ok("Commission settings updated")
  };

  // ── Admin: stats & payouts ───────────────────────────────────────────────────

  public shared ({ caller }) func adminGetAffiliateStats(
    affiliateId : Text
  ) : async AffiliateTypes.AffiliateStats {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    AffiliateLib.getAffiliateStats(clicks, leadRefs, conversions, payouts, affiliateId)
  };

  public shared ({ caller }) func adminAddPayout(
    record : AffiliateTypes.PayoutRecord
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    AffiliateLib.addPayoutRecord(payouts, record);
    RolesLib.logActivity(activityLog, nextLogId, caller, callerRole(caller), "adminAddPayout", record.affiliateId, Time.now());
    #ok("Payout record added")
  };

  public shared ({ caller }) func adminGetPayoutHistory(
    affiliateId : Text
  ) : async [AffiliateTypes.PayoutRecord] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    AffiliateLib.getPayoutHistory(payouts, affiliateId)
  };

  public shared ({ caller }) func adminUpdatePayoutRecord(
    id : Text,
    status : AffiliateTypes.PayoutStatus,
    adjustedBy : ?Principal,
    adjustmentNote : Text,
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    let now = Time.now();
    let result = AffiliateLib.updatePayoutRecord(payouts, id, status, ?now, adjustedBy, adjustmentNote);
    RolesLib.logActivity(activityLog, nextLogId, caller, callerRole(caller), "adminUpdatePayoutRecord", id, now);
    result
  };

  public shared ({ caller }) func adminAdjustCommission(
    affiliateId : Text,
    amount : Float,
    reason : Text,
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageAffiliates);
    let result = AffiliateLib.adjustCommission(payouts, affiliateId, amount, reason, caller, Time.now(), nextPayoutId);
    RolesLib.logActivity(activityLog, nextLogId, caller, callerRole(caller), "adminAdjustCommission", affiliateId, Time.now());
    result
  };
};
