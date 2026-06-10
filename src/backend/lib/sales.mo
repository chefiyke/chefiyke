import Types "../types/sales";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  // Add a new order to the store
  public func addOrder(
    orders : List.List<Types.Order>,
    order : Types.Order,
  ) {
    orders.add(order)
  };

  // Update an existing order by id. Returns #ok if found and updated, #err otherwise.
  public func updateOrder(
    orders : List.List<Types.Order>,
    id : Text,
    updates : Types.Order,
  ) : { #ok : Text; #err : Text } {
    var found = false;
    orders.mapInPlace(func(o) {
      if (o.id == id) {
        found := true;
        updates
      } else {
        o
      }
    });
    if (found) { #ok("updated") } else { #err("Order not found") }
  };

  // Retrieve orders filtered by the provided criteria
  public func getOrders(
    orders : List.List<Types.Order>,
    filter : Types.SalesFilter,
  ) : [Types.Order] {
    orders.filter(func(o) {
      let afterFrom = switch (filter.fromDate) {
        case null { true };
        case (?t) { o.createdAt >= t };
      };
      let beforeTo = switch (filter.toDate) {
        case null { true };
        case (?t) { o.createdAt <= t };
      };
      let matchProduct = switch (filter.product) {
        case null { true };
        case (?p) { o.product == p };
      };
      let matchStatus = switch (filter.status) {
        case null { true };
        case (?s) { o.status == s };
      };
      let matchStaff = switch (filter.assignedStaff) {
        case null { true };
        case (?sp) {
          switch (o.assignedStaff) {
            case null { false };
            case (?op) { Principal.equal(op, sp) };
          }
        };
      };
      afterFrom and beforeTo and matchProduct and matchStatus and matchStaff
    }).toArray()
  };

  // Get a single order by id
  public func getOrder(
    orders : List.List<Types.Order>,
    id : Text,
  ) : ?Types.Order {
    orders.find(func(o) { o.id == id })
  };

  // Compute aggregate statistics over all orders
  public func getOrderStats(
    orders : List.List<Types.Order>
  ) : Types.SalesStats {
    var totalRevenue : Float = 0.0;
    var pendingPayments : Nat = 0;
    let totalOrders = orders.size();
    orders.forEach(func(o) {
      totalRevenue += o.amount;
      if (o.status == #pending) {
        pendingPayments += 1;
      };
    });
    { totalOrders; totalRevenue; pendingPayments }
  };
};
