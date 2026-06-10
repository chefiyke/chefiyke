import SalesTypes "../types/sales";
import SalesLib "../lib/sales";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

// Sales management API.
// All admin functions require CanManageSales permission (enforced via controller check
// until the roles lib is merged — see requirement note).
mixin (
  orders : List.List<SalesTypes.Order>,
  nextOrderId : { var value : Nat },
) {
  // ── Access guard ────────────────────────────────────────────────────────────
  // Placeholder until roles lib is wired. Controller = PlatformOwner.
  func requireSalesAccess(caller : Principal) {
    if (not caller.isController()) {
      Runtime.trap("Unauthorized: requires CanManageSales permission")
    }
  };

  // ── Admin: create order ─────────────────────────────────────────────────────
  public shared ({ caller }) func adminAddOrder(
    customerName : Text,
    customerEmail : Text,
    product : Text,
    amount : Float,
    notes : Text,
    customerId : ?Principal,
    assignedStaff : ?Principal,
  ) : async { #ok : Text; #err : Text } {
    requireSalesAccess(caller);
    let id = "order-" # debug_show(nextOrderId.value);
    nextOrderId.value += 1;
    let now = Time.now();
    let order : SalesTypes.Order = {
      id;
      customerId;
      customerName;
      customerEmail;
      product;
      amount;
      status = #pending;
      notes;
      assignedStaff;
      createdAt = now;
      updatedAt = now;
    };
    SalesLib.addOrder(orders, order);
    #ok(id)
  };

  // ── Admin: update order ─────────────────────────────────────────────────────
  public shared ({ caller }) func adminUpdateOrder(
    id : Text,
    customerName : Text,
    customerEmail : Text,
    product : Text,
    amount : Float,
    status : SalesTypes.OrderStatus,
    notes : Text,
    customerId : ?Principal,
    assignedStaff : ?Principal,
    createdAt : Int,
  ) : async { #ok : Text; #err : Text } {
    requireSalesAccess(caller);
    let now = Time.now();
    let updates : SalesTypes.Order = {
      id;
      customerId;
      customerName;
      customerEmail;
      product;
      amount;
      status;
      notes;
      assignedStaff;
      createdAt;
      updatedAt = now;
    };
    SalesLib.updateOrder(orders, id, updates)
  };

  // ── Admin: query orders ─────────────────────────────────────────────────────
  public shared ({ caller }) func adminGetOrders(
    filter : SalesTypes.SalesFilter
  ) : async [SalesTypes.Order] {
    requireSalesAccess(caller);
    SalesLib.getOrders(orders, filter)
  };

  public shared ({ caller }) func adminGetOrder(id : Text) : async ?SalesTypes.Order {
    requireSalesAccess(caller);
    SalesLib.getOrder(orders, id)
  };

  // ── Admin: sales statistics ─────────────────────────────────────────────────
  public shared ({ caller }) func adminGetSalesStats() : async SalesTypes.SalesStats {
    requireSalesAccess(caller);
    SalesLib.getOrderStats(orders)
  };
};
