import BuyerLeadsTypes "../types/buyer-leads";
import SecurityTypes "../types/security";
import SecurityLib "security";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  // ── Submit a buyer interest form (public, rate-limited) ───────────────────────

  public func submitBuyerLead(
    leads : List.List<BuyerLeadsTypes.BuyerLead>,
    nextLeadId : { var value : Nat },
    rateLimits : Map.Map<Text, SecurityTypes.RateLimitEntry>,
    blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
    callerKey : Text,
    name : Text,
    email : Text,
    phone : Text,
    businessName : Text,
    businessType : Text,
    projectDescription : Text,
    timeline : Text,
    budgetRange : Text,
    formSource : BuyerLeadsTypes.FormSource,
  ) : { #ok : Text; #err : Text } {
    let now = Time.now();

    // Firewall check: blocked + rate limit (max 3 per minute for public submissions)
    let verdict = SecurityLib.firewallCheck(blockedKeys, rateLimits, callerKey, 3, now);
    switch verdict {
      case (#blocked(reason)) { return #err(reason) };
      case (#rateLimited(reason)) { return #err(reason) };
      case (#allow) {};
    };

    // Basic input validation: name and email must be non-empty
    if (name.size() == 0 or email.size() == 0) {
      return #err("Invalid submission")
    };

    // Record this request for rate limiting
    SecurityLib.recordRequest(rateLimits, callerKey, now);

    let id = nextLeadId.value;
    nextLeadId.value += 1;

    leads.add({
      id;
      name;
      email;
      phone;
      businessName;
      businessType;
      projectDescription;
      timeline;
      budgetRange;
      formSource;
      status = #New;
      notes = null;
      createdAt = now;
      updatedAt = now;
      assignedTo = null;
    });

    #ok("Your interest has been submitted. We will reach out soon!")
  };

  // ── Admin: list all buyer leads (with optional status/source filter) ──────────

  public func adminListBuyerLeads(
    leads : List.List<BuyerLeadsTypes.BuyerLead>,
    statusFilter : ?BuyerLeadsTypes.BuyerLeadStatus,
    sourceFilter : ?BuyerLeadsTypes.FormSource,
  ) : [BuyerLeadsTypes.BuyerLead] {
    let filtered = leads.filter(func(lead : BuyerLeadsTypes.BuyerLead) : Bool {
      let statusMatch = switch statusFilter {
        case null { true };
        case (?s) {
          switch (lead.status, s) {
            case (#New, #New) { true };
            case (#Contacted, #Contacted) { true };
            case (#Converted, #Converted) { true };
            case (#Rejected, #Rejected) { true };
            case _ { false };
          }
        };
      };
      let sourceMatch = switch sourceFilter {
        case null { true };
        case (?src) {
          switch (lead.formSource, src) {
            case (#Hero, #Hero) { true };
            case (#MidPage, #MidPage) { true };
            case (#Footer, #Footer) { true };
            case _ { false };
          }
        };
      };
      statusMatch and sourceMatch
    });
    filtered.toArray()
  };

  // ── Admin: update lead status and notes ───────────────────────────────────────

  public func adminUpdateBuyerLeadStatus(
    leads : List.List<BuyerLeadsTypes.BuyerLead>,
    leadId : Nat,
    newStatus : BuyerLeadsTypes.BuyerLeadStatus,
    notes : ?Text,
  ) : { #ok : Text; #err : Text } {
    var found = false;
    let now = Time.now();
    leads.mapInPlace(func(lead : BuyerLeadsTypes.BuyerLead) : BuyerLeadsTypes.BuyerLead {
      if (lead.id == leadId) {
        found := true;
        { lead with status = newStatus; notes; updatedAt = now }
      } else {
        lead
      }
    });
    if (found) {
      #ok("Lead status updated successfully")
    } else {
      #err("Lead not found")
    }
  };
};
