import Types "../types/systems";
import RolesTypes "../types/roles";
import RolesLib "../lib/roles";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

module {
  // ── Helpers ──────────────────────────────────────────────────────────────────

  func generateId(size : Nat) : Text {
    "sys-" # Time.now().toText() # "-" # size.toText()
  };

  func trimText(t : Text) : Text {
    t.trimStart(#predicate(func(c : Char) : Bool { c == ' ' }))
     .trimEnd(#predicate(func(c : Char) : Bool { c == ' ' }))
  };

  func validateInputs(name : Text, description : Text, url : Text) {
    if (trimText(name).size() == 0) {
      Runtime.trap("App name cannot be empty")
    };
    if (trimText(description).size() == 0) {
      Runtime.trap("App description cannot be empty")
    };
    let cleanUrl = trimText(url);
    if (cleanUrl.size() == 0) {
      Runtime.trap("App URL cannot be empty")
    };
    if (not (cleanUrl.startsWith(#text "http://") or cleanUrl.startsWith(#text "https://"))) {
      Runtime.trap("App URL must start with http:// or https://")
    };
  };

  func callerRole(
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    caller : Principal,
  ) : RolesTypes.UserRole {
    switch (RolesLib.getRole(roleUsers, caller)) {
      case (?r) { r };
      case null { #Customer };
    }
  };

  // ── Getters ──────────────────────────────────────────────────────────────────

  /// Returns only visible apps, sorted by order ascending.
  public func getVisibleApps(
    apps : List.List<Types.SystemApp>
  ) : [Types.SystemApp] {
    let visible = apps.filter(func(a : Types.SystemApp) : Bool { a.isVisible });
    visible.sort(func(a : Types.SystemApp, b : Types.SystemApp) : Order.Order {
      if (a.order < b.order) { #less }
      else if (a.order > b.order) { #greater }
      else { #equal }
    }).toArray()
  };

  /// Returns all apps (including hidden), sorted by createdAt descending (newest first).
  public func getAllApps(
    apps : List.List<Types.SystemApp>
  ) : [Types.SystemApp] {
    apps.sort(func(a : Types.SystemApp, b : Types.SystemApp) : Order.Order {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal }
    }).toArray()
  };

  // ── Mutations ────────────────────────────────────────────────────────────────

  /// Adds a new app. Validates inputs, generates unique id, sets order, returns the new app.
  public func addApp(
    apps : List.List<Types.SystemApp>,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    name : Text,
    description : Text,
    url : Text,
  ) : Types.SystemApp {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    let cleanName = trimText(name);
    let cleanDesc = trimText(description);
    let cleanUrl = trimText(url);
    validateInputs(cleanName, cleanDesc, cleanUrl);

    let newApp : Types.SystemApp = {
      id = generateId(apps.size());
      name = cleanName;
      description = cleanDesc;
      url = cleanUrl;
      isVisible = true;
      order = apps.size() + 1;
      createdAt = Time.now();
    };
    apps.add(newApp);

    let role = callerRole(roleUsers, caller);
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "AddSystemApp", newApp.id, 0);
    newApp
  };

  /// Edits name, description, and url of an existing app. Validates inputs.
  public func editApp(
    apps : List.List<Types.SystemApp>,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    id : Text,
    name : Text,
    description : Text,
    url : Text,
  ) {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    let cleanName = trimText(name);
    let cleanDesc = trimText(description);
    let cleanUrl = trimText(url);
    validateInputs(cleanName, cleanDesc, cleanUrl);

    var found = false;
    apps.mapInPlace(func(a : Types.SystemApp) : Types.SystemApp {
      if (a.id == id) {
        found := true;
        { a with name = cleanName; description = cleanDesc; url = cleanUrl }
      } else { a }
    });
    if (not found) {
      Runtime.trap("System app not found: " # id)
    };

    let role = callerRole(roleUsers, caller);
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "EditSystemApp", id, 0);
  };

  /// Flips the isVisible flag of the given app. Returns the new visibility value.
  public func toggleAppVisibility(
    apps : List.List<Types.SystemApp>,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    id : Text,
  ) : Bool {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);

    var newVisibility = false;
    var found = false;
    apps.mapInPlace(func(a : Types.SystemApp) : Types.SystemApp {
      if (a.id == id) {
        found := true;
        newVisibility := not a.isVisible;
        { a with isVisible = newVisibility }
      } else { a }
    });
    if (not found) {
      Runtime.trap("System app not found: " # id)
    };

    let role = callerRole(roleUsers, caller);
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "ToggleSystemApp", id, 0);
    newVisibility
  };

  /// Removes a system app by id. Traps if not found.
  public func deleteApp(
    apps : List.List<Types.SystemApp>,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    activityLog : List.List<RolesTypes.ActivityLog>,
    nextLogId : { var value : Nat },
    caller : Principal,
    id : Text,
  ) {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);

    let sizeBefore = apps.size();
    let kept = apps.filter(func(a : Types.SystemApp) : Bool { a.id != id });
    apps.clear();
    apps.append(kept);

    if (apps.size() == sizeBefore) {
      Runtime.trap("System app not found: " # id)
    };

    let role = callerRole(roleUsers, caller);
    RolesLib.logActivity(activityLog, nextLogId, caller, role, "DeleteSystemApp", id, 0);
  };
};
