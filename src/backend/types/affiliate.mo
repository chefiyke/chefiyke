import CommonTypes "common";

module {
  // ── Core profile ────────────────────────────────────────────────────────────

  public type AffiliateStatus = {
    #pending;
    #approved;
    #rejected;
    #disabled;
  };

  // An affiliate registered via the invite-links extension
  public type AffiliateProfile = {
    principal : Principal;
    inviteCode : Text; // the code used to join
    name : Text;
    joinedAt : CommonTypes.Timestamp;
    status : AffiliateStatus;
    email : Text;
    referralCode : Text; // unique code this affiliate shares
    rejectionReason : ?Text;
  };

  // ── Commission ──────────────────────────────────────────────────────────────

  // Per-product or global commission override. key = product identifier or "default"
  public type CommissionSettings = {
    defaultRate : Float; // e.g. 0.10 = 10%
    overrideRates : [(Text, Float)]; // [(productId, rate)]
  };

  // ── Events ──────────────────────────────────────────────────────────────────

  public type ClickEvent = {
    affiliateId : Text; // referral code of affiliate
    timestamp : CommonTypes.Timestamp;
    deviceType : Text;
    referrerSource : Text;
  };

  public type ConversionEvent = {
    affiliateId : Text;
    orderId : Text;
    amount : Float;
    commission : Float;
    timestamp : CommonTypes.Timestamp;
  };

  // ── Payouts ─────────────────────────────────────────────────────────────────

  public type PayoutStatus = {
    #pending;
    #completed;
  };

  public type PayoutRecord = {
    id : Text;
    affiliateId : Text;
    amount : Float;
    method : Text; // e.g. "bank_transfer", "crypto"
    status : PayoutStatus;
    requestedAt : CommonTypes.Timestamp;
    processedAt : ?CommonTypes.Timestamp;
    adjustedBy : ?Principal;
    adjustmentNote : Text;
  };

  // ── Stats ────────────────────────────────────────────────────────────────────

  public type AffiliateStats = {
    totalClicks : Nat;
    totalLeads : Nat;
    totalConversions : Nat;
    totalCommissionEarned : Float;
    pendingPayout : Float;
  };
};
