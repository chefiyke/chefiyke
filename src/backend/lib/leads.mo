import Types "../types/leads";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  // Add a new lead to the store
  public func addLead(
    leads : List.List<Types.Lead>,
    lead : Types.Lead,
  ) {
    leads.add(lead)
  };

  // Update an existing lead by id. Returns #ok if found and updated, #err otherwise.
  public func updateLead(
    leads : List.List<Types.Lead>,
    id : Text,
    updates : Types.Lead,
  ) : { #ok : Text; #err : Text } {
    var found = false;
    leads.mapInPlace(func(l) {
      if (l.id == id) {
        found := true;
        updates
      } else {
        l
      }
    });
    if (found) { #ok("updated") } else { #err("Lead not found") }
  };

  // Retrieve leads filtered by the provided criteria
  public func getLeads(
    leads : List.List<Types.Lead>,
    filter : Types.LeadFilter,
  ) : [Types.Lead] {
    leads.filter(func(l) {
      let matchStatus = switch (filter.status) {
        case null { true };
        case (?s) { l.status == s };
      };
      let matchSource = switch (filter.source) {
        case null { true };
        case (?src) { l.source == src };
      };
      let matchStaff = switch (filter.assignedStaff) {
        case null { true };
        case (?sp) {
          switch (l.assignedStaff) {
            case null { false };
            case (?lp) { Principal.equal(lp, sp) };
          }
        };
      };
      let afterFrom = switch (filter.fromDate) {
        case null { true };
        case (?t) { l.createdAt >= t };
      };
      let beforeTo = switch (filter.toDate) {
        case null { true };
        case (?t) { l.createdAt <= t };
      };
      matchStatus and matchSource and matchStaff and afterFrom and beforeTo
    }).toArray()
  };

  // Get a single lead by id
  public func getLead(
    leads : List.List<Types.Lead>,
    id : Text,
  ) : ?Types.Lead {
    leads.find(func(l) { l.id == id })
  };

  // Compute aggregate statistics over all leads
  public func getLeadStats(
    leads : List.List<Types.Lead>
  ) : Types.LeadStats {
    let totalLeads = leads.size();
    let newLeads = leads.filter(func(l) { l.status == #new_ }).size();
    let qualifiedLeads = leads.filter(func(l) { l.status == #qualified }).size();
    { totalLeads; newLeads; qualifiedLeads }
  };
};
