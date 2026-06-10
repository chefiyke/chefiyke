import CommonTypes "common";

module {
  // ── Payment method variants ─────────────────────────────────────────────────

  public type LocalBankConfig = {
    bankName : Text;
    accountNumber : Text;
    accountName : Text;
  };

  public type PaystackConfig = {
    publicKey : Text;
    secretKey : Text; // NEVER returned to frontend
    webhookSecret : Text; // NEVER returned to frontend
  };

  public type FlutterwaveConfig = {
    publicKey : Text;
    secretKey : Text; // NEVER returned to frontend
    webhookSecret : Text; // NEVER returned to frontend
  };

  public type PaymentMethod = {
    #LocalBank : LocalBankConfig;
    #Paystack : PaystackConfig;
    #Flutterwave : FlutterwaveConfig;
  };

  // ── Payment config stored in backend ────────────────────────────────────────

  public type PaymentConfig = {
    enabledMethods : [{ #localBank; #paystack; #flutterwave }];
    localBank : ?LocalBankConfig;
    paystack : ?PaystackConfig;
    flutterwave : ?FlutterwaveConfig;
    defaultCurrency : Text; // e.g. "NGN"
    servicePriceNgn : Nat; // landing page price in kobo (minor unit)
    updatedAt : CommonTypes.Timestamp;
  };

  // ── Safe public-facing config (no secret keys) ───────────────────────────────

  public type PaymentConfigPublic = {
    enabledMethods : [{ #localBank; #paystack; #flutterwave }];
    localBank : ?LocalBankConfig;
    paystackPublicKey : ?Text;
    flutterwavePublicKey : ?Text;
    defaultCurrency : Text;
    servicePriceNgn : Nat;
  };

  // ── Payment order ────────────────────────────────────────────────────────────

  public type PaymentOrderStatus = {
    #Pending;
    #Completed;
    #Rejected;
    #Failed;
  };

  public type PaymentOrder = {
    orderId : Nat;
    amount : Nat; // in minor units (kobo)
    currency : Text;
    method : { #localBank; #paystack; #flutterwave };
    payerEmail : Text;
    payerName : Text;
    payerPhone : ?Text;
    webhookRef : ?Text; // transaction reference from gateway
    status : PaymentOrderStatus;
    createdAt : CommonTypes.Timestamp;
    updatedAt : CommonTypes.Timestamp;
    approvedBy : ?Principal; // set on manual backend approval
    notes : ?Text;
  };
};
