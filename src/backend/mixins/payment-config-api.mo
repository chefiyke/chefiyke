import PaymentTypes "../types/payment";
import RolesTypes "../types/roles";
import AuditTypes "../types/audit";
import PaymentLib "../lib/payment";
import RolesLib "../lib/roles";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  paymentConfig : { var value : PaymentTypes.PaymentConfig },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  // ── Public: get safe payment config (no secrets) ──────────────────────────────

  public query func getPaymentConfig() : async PaymentTypes.PaymentConfigPublic {
    PaymentLib.getPaymentConfigPublic(paymentConfig)
  };

  // ── Admin: get full payment config (includes secrets) ─────────────────────────

  public shared ({ caller }) func adminGetPaymentConfig() : async PaymentTypes.PaymentConfig {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    PaymentLib.adminGetPaymentConfig(paymentConfig, roleUsers, caller)
  };

  // ── Admin: set payment config ─────────────────────────────────────────────────

  public shared ({ caller }) func adminSetPaymentConfig(
    payload : PaymentTypes.PaymentConfig
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    PaymentLib.adminSetPaymentConfig(
      paymentConfig,
      roleUsers,
      activityLog,
      nextLogId,
      caller,
      payload,
    )
  };
};
