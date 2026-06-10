import Map "mo:core/Map";
import Types "../types/client-portal";
import RolesTypes "../types/roles";
import Lib "../lib/client-portal";

mixin (
  clientProjects : Lib.ProjectMap,
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
) {

  // ── Client-facing: view own project ──────────────────────────────────────────

  public shared ({ caller }) func clientGetMyProject() : async { #ok : Types.ClientProject; #err : Text } {
    Lib.getMyProject(caller, clientProjects)
  };

  // ── Admin: create a new client project ────────────────────────────────────────

  public shared ({ caller }) func adminCreateProject(req : Types.CreateProjectRequest) : async { #ok : Text; #err : Text } {
    Lib.createProject(caller, req, clientProjects, roleUsers)
  };

  // ── Admin: update project details / status ────────────────────────────────────

  public shared ({ caller }) func adminUpdateProject(projectId : Text, req : Types.UpdateProjectRequest) : async { #ok : (); #err : Text } {
    Lib.updateProject(caller, projectId, req, clientProjects, roleUsers)
  };

  // ── Admin: add a progress note/update ────────────────────────────────────────

  public shared ({ caller }) func adminAddUpdate(projectId : Text, title : Text, content : Text) : async { #ok : (); #err : Text } {
    Lib.addUpdate(caller, projectId, title, content, clientProjects, roleUsers)
  };

  // ── Admin: add a deliverable ──────────────────────────────────────────────────

  public shared ({ caller }) func adminAddDeliverable(projectId : Text, deliverable : Types.Deliverable) : async { #ok : (); #err : Text } {
    Lib.addDeliverable(caller, projectId, deliverable, clientProjects, roleUsers)
  };

  // ── Admin: mark / unmark a next step ─────────────────────────────────────────

  public shared ({ caller }) func adminUpdateNextStep(projectId : Text, stepId : Text, isCompleted : Bool) : async { #ok : (); #err : Text } {
    Lib.updateNextStep(caller, projectId, stepId, isCompleted, clientProjects, roleUsers)
  };

  // ── Admin: append a next step ─────────────────────────────────────────────────

  public shared ({ caller }) func adminAddNextStep(projectId : Text, description : Text) : async { #ok : (); #err : Text } {
    Lib.addNextStep(caller, projectId, description, clientProjects, roleUsers)
  };

  // ── Admin: list all client projects ──────────────────────────────────────────

  public shared ({ caller }) func adminGetAllProjects() : async { #ok : [Types.ClientProject]; #err : Text } {
    Lib.getAllProjects(caller, clientProjects, roleUsers)
  };

  // ── Admin: get a single project by ID ────────────────────────────────────────

  public shared ({ caller }) func adminGetProjectById(id : Text) : async { #ok : Types.ClientProject; #err : Text } {
    Lib.getProjectById(caller, id, clientProjects, roleUsers)
  };
};
