import CryptoPaymentTypes "../types/crypto-payment";
import RolesTypes "../types/roles";
import AuditTypes "../types/audit";
import RolesLib "../lib/roles";
import AuditLib "../lib/audit";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";

// Crypto payment configuration — persistent backend storage.
// Replaces localStorage-based storage in AdminCryptoPayment.tsx.
// Settings are stored in canister state and survive upgrades.

mixin (
  cryptoPaymentConfig : { var value : ?CryptoPaymentTypes.CryptoPaymentConfig },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  auditLogs : List.List<AuditTypes.AuditLog>,
  nextAuditLogId : { var value : Nat },
) {
  // ── Admin: store crypto payment configuration ─────────────────────────────────

  public shared ({ caller }) func adminSetCryptoPaymentConfig(
    config : CryptoPaymentTypes.CryptoPaymentConfig
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    if (config.enabled) {
      if (config.usdtWalletAddress.size() < 20) {
        return #err("Invalid USDT wallet address")
      };
      if (config.usdcEnabled and config.usdcWalletAddress.size() < 20) {
        return #err("Invalid USDC wallet address")
      }
    };
    cryptoPaymentConfig.value := ?config;
    let role = switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    };
    let enabledText = if (config.enabled) { "true" } else { "false" };
    AuditLib.recordAuditLog(
      auditLogs,
      nextAuditLogId,
      caller,
      role,
      #Update,
      "CryptoPaymentConfig",
      "Crypto payment config updated. Enabled=" # enabledText,
      null,
    );
    #ok("Crypto payment configuration updated")
  };

  // ── Admin: retrieve full crypto payment configuration ─────────────────────────

  public shared ({ caller }) func adminGetCryptoPaymentConfig() : async { #ok : CryptoPaymentTypes.CryptoPaymentConfig; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManagePayments);
    switch (cryptoPaymentConfig.value) {
      case (?cfg) { #ok(cfg) };
      case null {
        #ok({
          enabled = false;
          usdtWalletAddress = "";
          usdcWalletAddress = "";
          usdcEnabled = false;
          paymentInstructions = "Send the exact USDT amount to the wallet address above and upload your transaction screenshot as proof of payment.";
          network = "TRC20";
          eligibleOfferIds = [];
        })
      };
    }
  };

  // ── Public: get safe crypto payment info (no internal fields) ─────────────────
  // Returns only the fields safe for frontend display.
  // eligibleOfferIds and internal config are NOT included.

  public query func getPublicCryptoPaymentInfo() : async ?CryptoPaymentTypes.CryptoPaymentPublic {
    switch (cryptoPaymentConfig.value) {
      case null { null };
      case (?cfg) {
        if (not cfg.enabled) {
          null
        } else {
          ?{
            enabled = cfg.enabled;
            usdtWalletAddress = cfg.usdtWalletAddress;
            usdcWalletAddress = cfg.usdcWalletAddress;
            usdcEnabled = cfg.usdcEnabled;
            paymentInstructions = cfg.paymentInstructions;
            network = cfg.network;
          }
        }
      };
    }
  };
};
