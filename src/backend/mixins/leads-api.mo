import LeadsTypes "../types/leads";
import LeadsLib "../lib/leads";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

// Leads management API.
// All admin functions require CanManageLeads permission (controller check used
// as placeholder until roles lib is merged).
mixin (
  leads : List.List<LeadsTypes.Lead>,
  nextLeadId : { var value : Nat },
) {
  // ── Access guard ────────────────────────────────────────────────────────────
  func requireLeadsAccess(caller : Principal) {
    if (not caller.isController()) {
      Runtime.trap("Unauthorized: requires CanManageLeads permission")
    }
  };

  // ── Internal helper: create a lead from a contact form submission ───────────
  // Called by content-api.mo after a successful submitContactMessage.
  public func _internalCreateLeadFromContact(
    name : Text,
    email : Text,
    message : Text,
    affiliateRef : ?Text,
    nowNanos : Int,
  ) : () {
    let id = "lead-" # debug_show(nextLeadId.value);
    nextLeadId.value += 1;
    let lead : LeadsTypes.Lead = {
      id;
      name;
      email;
      phone = null;
      message;
      source = #contact_form;
      status = #new_;
      notes = "";
      assignedStaff = null;
      createdAt = nowNanos;
      updatedAt = nowNanos;
      affiliateRef;
    };
    LeadsLib.addLead(leads, lead)
  };

  // ── Admin: query leads ──────────────────────────────────────────────────────
  public shared ({ caller }) func adminGetLeads(
    filter : LeadsTypes.LeadFilter
  ) : async [LeadsTypes.Lead] {
    requireLeadsAccess(caller);
    LeadsLib.getLeads(leads, filter)
  };

  public shared ({ caller }) func adminGetLead(id : Text) : async ?LeadsTypes.Lead {
    requireLeadsAccess(caller);
    LeadsLib.getLead(leads, id)
  };

  // ── Admin: update lead ──────────────────────────────────────────────────────
  public shared ({ caller }) func adminUpdateLead(
    id : Text,
    name : Text,
    email : Text,
    phone : ?Text,
    message : Text,
    source : LeadsTypes.LeadSource,
    status : LeadsTypes.LeadStatus,
    notes : Text,
    assignedStaff : ?Principal,
    affiliateRef : ?Text,
    createdAt : Int,
  ) : async { #ok : Text; #err : Text } {
    requireLeadsAccess(caller);
    let now = Time.now();
    let updates : LeadsTypes.Lead = {
      id;
      name;
      email;
      phone;
      message;
      source;
      status;
      notes;
      assignedStaff;
      createdAt;
      updatedAt = now;
      affiliateRef;
    };
    LeadsLib.updateLead(leads, id, updates)
  };

  // ── Admin: lead statistics ──────────────────────────────────────────────────
  public shared ({ caller }) func adminGetLeadStats() : async LeadsTypes.LeadStats {
    requireLeadsAccess(caller);
    LeadsLib.getLeadStats(leads)
  };
};
