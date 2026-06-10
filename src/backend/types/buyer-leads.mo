import CommonTypes "common";

module {
  public type BuyerLeadStatus = {
    #New;
    #Contacted;
    #Converted;
    #Rejected;
  };

  public type FormSource = {
    #Hero;
    #MidPage;
    #Footer;
  };

  public type BuyerLead = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    businessName : Text;
    businessType : Text;
    projectDescription : Text;
    timeline : Text;
    budgetRange : Text;
    formSource : FormSource;
    status : BuyerLeadStatus;
    notes : ?Text;
    createdAt : CommonTypes.Timestamp;
    updatedAt : CommonTypes.Timestamp;
    assignedTo : ?Principal;
  };
};
