import Types "../types/affiliate";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  // ── Profile lookup ──────────────────────────────────────────────────────────

  // Get affiliate profile for a given principal
  public func getProfile(
    affiliates : Map.Map<Principal, Types.AffiliateProfile>,
    principal : Principal,
  ) : ?Types.AffiliateProfile {
    affiliates.get(principal)
  };

  // Get affiliate profile by referral code
  public func getProfileByCode(
    affiliates : Map.Map<Principal, Types.AffiliateProfile>,
    code : Text,
  ) : ?Types.AffiliateProfile {
    switch (affiliates.entries().find(func((_, p)) { p.referralCode == code })) {
      case null { null };
      case (?(_, p)) { ?p };
    }
  };

  // Register a new affiliate after invite code redemption
  public func register(
    affiliates : Map.Map<Principal, Types.AffiliateProfile>,
    principal : Principal,
    inviteCode : Text,
    name : Text,
    email : Text,
    referralCode : Text,
    nowNanos : Int,
  ) {
    affiliates.add(principal, {
      principal;
      inviteCode;
      name;
      email;
      referralCode;
      joinedAt = nowNanos;
      status = #pending;
      rejectionReason = null;
    });
  };

  // Check whether a principal is a registered affiliate
  public func isAffiliate(
    affiliates : Map.Map<Principal, Types.AffiliateProfile>,
    principal : Principal,
  ) : Bool {
    switch (affiliates.get(principal)) {
      case (?_) { true };
      case null { false };
    }
  };

  // ── Status management ───────────────────────────────────────────────────────

  public func approveAffiliate(
    affiliates : Map.Map<Principal, Types.AffiliateProfile>,
    principal : Principal,
  ) : { #ok : Text; #err : Text } {
    switch (affiliates.get(principal)) {
      case null { #err("Affiliate not found") };
      case (?profile) {
        affiliates.add(principal, { profile with status = #approved; rejectionReason = null });
        #ok("approved")
      };
    }
  };

  public func rejectAffiliate(
    affiliates : Map.Map<Principal, Types.AffiliateProfile>,
    principal : Principal,
    reason : Text,
  ) : { #ok : Text; #err : Text } {
    switch (affiliates.get(principal)) {
      case null { #err("Affiliate not found") };
      case (?profile) {
        affiliates.add(principal, { profile with status = #rejected; rejectionReason = ?reason });
        #ok("rejected")
      };
    }
  };

  public func disableAffiliate(
    affiliates : Map.Map<Principal, Types.AffiliateProfile>,
    principal : Principal,
  ) : { #ok : Text; #err : Text } {
    switch (affiliates.get(principal)) {
      case null { #err("Affiliate not found") };
      case (?profile) {
        affiliates.add(principal, { profile with status = #disabled });
        #ok("disabled")
      };
    }
  };

  // ── Analytics ───────────────────────────────────────────────────────────────

  // Record a referral link click
  public func recordClick(
    clicks : List.List<Types.ClickEvent>,
    affiliateId : Text,
    deviceType : Text,
    source : Text,
    nowNanos : Int,
  ) {
    clicks.add({
      affiliateId;
      timestamp = nowNanos;
      deviceType;
      referrerSource = source;
    });
  };

  // Record a lead attributed to an affiliate
  public func recordLead(
    leadRefs : Map.Map<Text, Nat>, // affiliateId -> lead count
    affiliateId : Text,
  ) {
    let current = switch (leadRefs.get(affiliateId)) {
      case null { 0 };
      case (?n) { n };
    };
    leadRefs.add(affiliateId, current + 1);
  };

  // Record a conversion (sale attributed to an affiliate)
  public func recordConversion(
    conversions : List.List<Types.ConversionEvent>,
    commissionSettings : { var value : Types.CommissionSettings },
    affiliateId : Text,
    orderId : Text,
    amount : Float,
    nowNanos : Int,
  ) {
    // Calculate commission using override rate if product key matches, else default
    let rate = commissionSettings.value.defaultRate;
    let commission = amount * rate;
    conversions.add({
      affiliateId;
      orderId;
      amount;
      commission;
      timestamp = nowNanos;
    });
  };

  // Compute stats for a given affiliate by their referral code
  public func getAffiliateStats(
    clicks : List.List<Types.ClickEvent>,
    leadRefs : Map.Map<Text, Nat>,
    conversions : List.List<Types.ConversionEvent>,
    payouts : List.List<Types.PayoutRecord>,
    affiliateId : Text,
  ) : Types.AffiliateStats {
    let totalClicks = clicks.filter(func(c) { c.affiliateId == affiliateId }).size();
    let totalLeads = switch (leadRefs.get(affiliateId)) {
      case null { 0 };
      case (?n) { n };
    };
    let myConversions = conversions.filter(func(c) { c.affiliateId == affiliateId });
    let totalConversions = myConversions.size();
    let totalCommissionEarned = myConversions.foldLeft(
      0.0,
      func(acc : Float, c : Types.ConversionEvent) : Float { acc + c.commission },
    );
    let paidOut = payouts
      .filter(func(p) { p.affiliateId == affiliateId and p.status == #completed })
      .foldLeft(0.0, func(acc : Float, p : Types.PayoutRecord) : Float { acc + p.amount });
    let pendingPayout = totalCommissionEarned - paidOut;
    { totalClicks; totalLeads; totalConversions; totalCommissionEarned; pendingPayout }
  };

  // ── Payouts ─────────────────────────────────────────────────────────────────

  public func addPayoutRecord(
    payouts : List.List<Types.PayoutRecord>,
    record : Types.PayoutRecord,
  ) {
    payouts.add(record)
  };

  public func updatePayoutRecord(
    payouts : List.List<Types.PayoutRecord>,
    id : Text,
    status : Types.PayoutStatus,
    processedAt : ?Int,
    adjustedBy : ?Principal,
    adjustmentNote : Text,
  ) : { #ok : Text; #err : Text } {
    var found = false;
    payouts.mapInPlace(func(p) {
      if (p.id == id) {
        found := true;
        { p with status; processedAt; adjustedBy; adjustmentNote }
      } else {
        p
      }
    });
    if (found) { #ok("updated") } else { #err("Payout record not found") }
  };

  public func getPayoutHistory(
    payouts : List.List<Types.PayoutRecord>,
    affiliateId : Text,
  ) : [Types.PayoutRecord] {
    payouts.filter(func(p) { p.affiliateId == affiliateId }).toArray()
  };

  // ── Commission settings ──────────────────────────────────────────────────────

  public func setCommissionSettings(
    commissionSettings : { var value : Types.CommissionSettings },
    settings : Types.CommissionSettings,
  ) {
    commissionSettings.value := settings
  };

  public func getCommissionSettings(
    commissionSettings : { var value : Types.CommissionSettings }
  ) : Types.CommissionSettings {
    commissionSettings.value
  };

  public func adjustCommission(
    payouts : List.List<Types.PayoutRecord>,
    affiliateId : Text,
    amount : Float,
    reason : Text,
    adjustedBy : Principal,
    nowNanos : Int,
    nextPayoutId : { var value : Nat },
  ) : { #ok : Text; #err : Text } {
    let id = "payout-adj-" # debug_show(nextPayoutId.value);
    nextPayoutId.value += 1;
    payouts.add({
      id;
      affiliateId;
      amount;
      method = "manual_adjustment";
      status = #completed;
      requestedAt = nowNanos;
      processedAt = ?nowNanos;
      adjustedBy = ?adjustedBy;
      adjustmentNote = reason;
    });
    #ok(id)
  };
};
