import CommonTypes "common";

module {
  public type LeadStatus = {
    #new_;
    #contacted;
    #qualified;
    #rejected;
    #converted;
  };

  public type LeadSource = {
    #contact_form;
    #affiliate_signup;
    #training_enrollment;
    #other;
  };

  public type Lead = {
    id : Text;
    name : Text;
    email : Text;
    phone : ?Text;
    message : Text;
    source : LeadSource;
    status : LeadStatus;
    notes : Text;
    assignedStaff : ?Principal;
    createdAt : CommonTypes.Timestamp;
    updatedAt : CommonTypes.Timestamp;
    affiliateRef : ?Text;
  };

  public type LeadFilter = {
    status : ?LeadStatus;
    source : ?LeadSource;
    assignedStaff : ?Principal;
    fromDate : ?CommonTypes.Timestamp;
    toDate : ?CommonTypes.Timestamp;
  };

  public type LeadStats = {
    totalLeads : Nat;
    newLeads : Nat;
    qualifiedLeads : Nat;
  };
};
