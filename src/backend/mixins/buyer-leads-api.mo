import BuyerLeadsTypes "../types/buyer-leads";
import RolesTypes "../types/roles";
import AuditTypes "../types/audit";
import SecurityTypes "../types/security";
import BuyerLeadsLib "../lib/buyer-leads";
import RolesLib "../lib/roles";
import AuditLib "../lib/audit";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  buyerLeads : List.List<BuyerLeadsTypes.BuyerLead>,
  nextBuyerLeadId : { var value : Nat },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  auditLogs : List.List<AuditTypes.AuditLog>,
  nextAuditLogId : { var value : Nat },
  rateLimits : Map.Map<Text, SecurityTypes.RateLimitEntry>,
  blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
) {
  // ── Public: submit a buyer interest form ─────────────────────────────────────────

  public shared ({ caller }) func submitBuyerLead(
    name : Text,
    email : Text,
    phone : Text,
    businessName : Text,
    businessType : Text,
    projectDescription : Text,
    timeline : Text,
    budgetRange : Text,
    formSource : BuyerLeadsTypes.FormSource,
    honeypot : Text, // must be empty — bot trap
  ) : async { #ok : Text; #err : Text } {
    // Honeypot: bots fill this field; humans leave it empty
    if (honeypot.size() > 0) {
      return #err("Invalid submission")
    };
    let callerKey = caller.toText();
    BuyerLeadsLib.submitBuyerLead(
      buyerLeads,
      nextBuyerLeadId,
      rateLimits,
      blockedKeys,
      callerKey,
      name,
      email,
      phone,
      businessName,
      businessType,
      projectDescription,
      timeline,
      budgetRange,
      formSource,
    )
  };

  // ── Admin: list all buyer leads ─────────────────────────────────────────────

  public shared ({ caller }) func adminListBuyerLeads(
    statusFilter : ?BuyerLeadsTypes.BuyerLeadStatus,
    sourceFilter : ?BuyerLeadsTypes.FormSource,
  ) : async [BuyerLeadsTypes.BuyerLead] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageBuyerLeads);
    BuyerLeadsLib.adminListBuyerLeads(buyerLeads, statusFilter, sourceFilter)
  };

  // ── Admin: update buyer lead status ──────────────────────────────────────────

  public shared ({ caller }) func adminUpdateBuyerLeadStatus(
    leadId : Nat,
    newStatus : BuyerLeadsTypes.BuyerLeadStatus,
    notes : ?Text,
  ) : async { #ok : Text; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageBuyerLeads);
    let result = BuyerLeadsLib.adminUpdateBuyerLeadStatus(buyerLeads, leadId, newStatus, notes);
    switch result {
      case (#ok(_)) {
        let role = switch (RolesLib.getRole(roleUsers, caller)) {
          case (?r) { r };
          case null { #Customer };
        };
        let statusText = switch newStatus {
          case (#New) { "New" };
          case (#Contacted) { "Contacted" };
          case (#Converted) { "Converted" };
          case (#Rejected) { "Rejected" };
        };
        AuditLib.recordAuditLog(
          auditLogs,
          nextAuditLogId,
          caller,
          role,
          #Update,
          "BuyerLead:" # leadId.toText(),
          "Status updated to " # statusText,
          null,
        )
      };
      case _ {};
    };
    result
  };
};
