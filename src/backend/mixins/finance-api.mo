import FinanceTypes "../types/finance";
import RolesTypes "../types/roles";
import FinanceLib "../lib/finance";
import RolesLib "../lib/roles";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

// Admin-only API for financial tracking.
// All functions require CanManageFinance permission (enforced via RBAC).
mixin (
  financeEntries : List.List<FinanceTypes.FinanceEntry>,
  nextFinanceId : { var value : Nat },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  public shared ({ caller }) func adminGetFinanceEntries() : async [FinanceTypes.FinanceEntry] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageFinance);
    FinanceLib.getEntries(financeEntries)
  };

  public shared ({ caller }) func adminAddFinanceEntry(
    entryType : FinanceTypes.EntryType,
    amount : Nat,
    description : Text,
    date : Text,
  ) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageFinance);
    FinanceLib.addEntry(financeEntries, nextFinanceId, entryType, amount, description, date, Time.now());
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminAddFinanceEntry", description, Time.now())
  };

  public shared ({ caller }) func adminDeleteFinanceEntry(id : Nat) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageFinance);
    FinanceLib.deleteEntry(financeEntries, id);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminDeleteFinanceEntry", id.toText(), Time.now())
  };

  public shared ({ caller }) func adminGetFinanceSummary() : async FinanceTypes.FinanceSummary {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageFinance);
    FinanceLib.getSummary(financeEntries)
  };
};
