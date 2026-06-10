import CommonTypes "common";

module {
  public type OrderStatus = {
    #pending;
    #completed;
    #failed;
    #refunded;
  };

  public type Order = {
    id : Text;
    customerId : ?Principal;
    customerName : Text;
    customerEmail : Text;
    product : Text;
    amount : Float;
    status : OrderStatus;
    notes : Text;
    assignedStaff : ?Principal;
    createdAt : CommonTypes.Timestamp;
    updatedAt : CommonTypes.Timestamp;
  };

  public type SalesFilter = {
    fromDate : ?CommonTypes.Timestamp;
    toDate : ?CommonTypes.Timestamp;
    product : ?Text;
    status : ?OrderStatus;
    assignedStaff : ?Principal;
  };

  public type SalesStats = {
    totalOrders : Nat;
    totalRevenue : Float;
    pendingPayments : Nat;
  };
};
