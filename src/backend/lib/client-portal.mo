import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/client-portal";
import RolesTypes "../types/roles";

module {
  // ── Type aliases ──────────────────────────────────────────────────────────────

  public type ProjectMap = Map.Map<Text, Types.ClientProject>;

  // ── Auth helper ───────────────────────────────────────────────────────────────

  func isAdminOrOwner(caller : Principal, roleUsers : Map.Map<Principal, RolesTypes.StaffUser>) : Bool {
    switch (roleUsers.get(caller)) {
      case (?(user)) {
        switch (user.role) {
          case (#PlatformOwner) true;
          case (#Admin) true;
          case (_) false;
        };
      };
      case (null) false;
    };
  };

  // ── ID generation ─────────────────────────────────────────────────────────────

  func generateId(prefix : Text) : Text {
    prefix # "-" # Time.now().toText();
  };

  // ── Client-facing functions ───────────────────────────────────────────────────

  public func getMyProject(
    caller : Principal,
    projects : ProjectMap,
  ) : { #ok : Types.ClientProject; #err : Text } {
    switch (projects.entries().find(func((_, p) : (Text, Types.ClientProject)) : Bool { p.clientPrincipal == caller })) {
      case (?(_, project)) { #ok(project) };
      case (null) { #err("No project found for your account") };
    };
  };

  // ── Admin: create project ─────────────────────────────────────────────────────

  public func createProject(
    caller : Principal,
    req : Types.CreateProjectRequest,
    projects : ProjectMap,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  ) : { #ok : Text; #err : Text } {
    if (not isAdminOrOwner(caller, roleUsers)) {
      return #err("Access denied: Admin or PlatformOwner role required");
    };
    let id = generateId("proj");
    let now = Time.now();
    let project : Types.ClientProject = {
      id;
      clientPrincipal = req.clientPrincipal;
      clientName = req.clientName;
      clientEmail = req.clientEmail;
      tier = req.tier;
      projectTitle = req.projectTitle;
      projectDescription = req.projectDescription;
      status = #Pending;
      startDate = req.startDate;
      expectedEndDate = req.expectedEndDate;
      completedDate = null;
      deliverables = [];
      updates = [];
      nextSteps = [];
      createdAt = now;
      updatedAt = now;
    };
    projects.add(id, project);
    #ok(id);
  };

  // ── Admin: update project details ─────────────────────────────────────────────

  public func updateProject(
    caller : Principal,
    projectId : Text,
    req : Types.UpdateProjectRequest,
    projects : ProjectMap,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  ) : { #ok : (); #err : Text } {
    if (not isAdminOrOwner(caller, roleUsers)) {
      return #err("Access denied: Admin or PlatformOwner role required");
    };
    switch (projects.get(projectId)) {
      case (null) { #err("Project not found") };
      case (?existing) {
        let updated : Types.ClientProject = {
          existing with
          projectTitle = switch (req.projectTitle) { case (?t) t; case null existing.projectTitle };
          projectDescription = switch (req.projectDescription) { case (?d) d; case null existing.projectDescription };
          status = switch (req.status) { case (?s) s; case null existing.status };
          expectedEndDate = switch (req.expectedEndDate) { case (?e) ?e; case null existing.expectedEndDate };
          completedDate = switch (req.completedDate) { case (?c) ?c; case null existing.completedDate };
          updatedAt = Time.now();
        };
        projects.add(projectId, updated);
        #ok(());
      };
    };
  };

  // ── Admin: add progress update ────────────────────────────────────────────────

  public func addUpdate(
    caller : Principal,
    projectId : Text,
    title : Text,
    content : Text,
    projects : ProjectMap,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  ) : { #ok : (); #err : Text } {
    if (not isAdminOrOwner(caller, roleUsers)) {
      return #err("Access denied: Admin or PlatformOwner role required");
    };
    switch (projects.get(projectId)) {
      case (null) { #err("Project not found") };
      case (?existing) {
        let newUpdate : Types.ProjectUpdate = {
          id = generateId("upd");
          title;
          content;
          createdAt = Time.now();
          isPublished = true;
        };
        let updated : Types.ClientProject = {
          existing with
          updates = existing.updates.concat([newUpdate]);
          updatedAt = Time.now();
        };
        projects.add(projectId, updated);
        #ok(());
      };
    };
  };

  // ── Admin: add deliverable ────────────────────────────────────────────────────

  public func addDeliverable(
    caller : Principal,
    projectId : Text,
    deliverable : Types.Deliverable,
    projects : ProjectMap,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  ) : { #ok : (); #err : Text } {
    if (not isAdminOrOwner(caller, roleUsers)) {
      return #err("Access denied: Admin or PlatformOwner role required");
    };
    switch (projects.get(projectId)) {
      case (null) { #err("Project not found") };
      case (?existing) {
        let updated : Types.ClientProject = {
          existing with
          deliverables = existing.deliverables.concat([deliverable]);
          updatedAt = Time.now();
        };
        projects.add(projectId, updated);
        #ok(());
      };
    };
  };

  // ── Admin: add next step ──────────────────────────────────────────────────────

  public func addNextStep(
    caller : Principal,
    projectId : Text,
    description : Text,
    projects : ProjectMap,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  ) : { #ok : (); #err : Text } {
    if (not isAdminOrOwner(caller, roleUsers)) {
      return #err("Access denied: Admin or PlatformOwner role required");
    };
    switch (projects.get(projectId)) {
      case (null) { #err("Project not found") };
      case (?existing) {
        let step : Types.NextStep = {
          id = generateId("step");
          description;
          isCompleted = false;
          order = existing.nextSteps.size();
        };
        let updated : Types.ClientProject = {
          existing with
          nextSteps = existing.nextSteps.concat([step]);
          updatedAt = Time.now();
        };
        projects.add(projectId, updated);
        #ok(());
      };
    };
  };

  // ── Admin: update next step completion ────────────────────────────────────────

  public func updateNextStep(
    caller : Principal,
    projectId : Text,
    stepId : Text,
    isCompleted : Bool,
    projects : ProjectMap,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  ) : { #ok : (); #err : Text } {
    if (not isAdminOrOwner(caller, roleUsers)) {
      return #err("Access denied: Admin or PlatformOwner role required");
    };
    switch (projects.get(projectId)) {
      case (null) { #err("Project not found") };
      case (?existing) {
        let updatedSteps = existing.nextSteps.map(
          func(s : Types.NextStep) : Types.NextStep {
            if (s.id == stepId) { { s with isCompleted } } else { s };
          },
        );
        let updated : Types.ClientProject = {
          existing with
          nextSteps = updatedSteps;
          updatedAt = Time.now();
        };
        projects.add(projectId, updated);
        #ok(());
      };
    };
  };

  // ── Admin: list all projects ──────────────────────────────────────────────────

  public func getAllProjects(
    caller : Principal,
    projects : ProjectMap,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  ) : { #ok : [Types.ClientProject]; #err : Text } {
    if (not isAdminOrOwner(caller, roleUsers)) {
      return #err("Access denied: Admin or PlatformOwner role required");
    };
    #ok(projects.values().toArray());
  };

  // ── Admin: get project by id ──────────────────────────────────────────────────

  public func getProjectById(
    caller : Principal,
    id : Text,
    projects : ProjectMap,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  ) : { #ok : Types.ClientProject; #err : Text } {
    if (not isAdminOrOwner(caller, roleUsers)) {
      return #err("Access denied: Admin or PlatformOwner role required");
    };
    switch (projects.get(id)) {
      case (?project) { #ok(project) };
      case (null) { #err("Project not found") };
    };
  };
};
