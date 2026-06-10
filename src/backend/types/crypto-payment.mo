module {
  // ── Crypto payment configuration ──────────────────────────────────────────────
  // Persistent backend storage — replaces localStorage-based crypto config.

  public type CryptoPaymentConfig = {
    enabled : Bool;
    usdtWalletAddress : Text;
    usdcWalletAddress : Text;
    usdcEnabled : Bool;
    paymentInstructions : Text;
    network : Text; // "TRC20" (default), "ERC20", etc.
    eligibleOfferIds : [Text]; // which offer IDs accept crypto payment
  };

  // Public-safe subset — returned to frontend. Never includes eligibleOfferIds or internal fields.
  public type CryptoPaymentPublic = {
    enabled : Bool;
    usdtWalletAddress : Text;
    usdcWalletAddress : Text;
    usdcEnabled : Bool;
    paymentInstructions : Text;
    network : Text;
  };
};
