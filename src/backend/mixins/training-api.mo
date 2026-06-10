import TrainingTypes "../types/training";
import AffiliateTypes "../types/affiliate";
import RolesTypes "../types/roles";
import TrainingLib "../lib/training";
import AffiliateLib "../lib/affiliate";
import RolesLib "../lib/roles";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

// API for training modules and live sessions.
// Admin functions require CanManageTraining (RBAC).
// getTrainingModules requires affiliate role or CanManageTraining.
mixin (
  trainingModules : List.List<TrainingTypes.TrainingModule>,
  liveSessions : List.List<TrainingTypes.LiveSession>,
  nextModuleId : { var value : Nat },
  nextSessionId : { var value : Nat },
  affiliates : Map.Map<Principal, AffiliateTypes.AffiliateProfile>,
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
) {
  // ── Affiliate-gated public query ────────────────────────────────────────────

  // Only registered affiliates (or those with CanManageTraining) may view training modules
  public shared ({ caller }) func getTrainingModules() : async [TrainingTypes.TrainingModule] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    let authorized = AffiliateLib.isAffiliate(affiliates, caller)
      or RolesLib.userHasPermission(roleUsers, caller, #CanManageTraining);
    assert authorized;
    TrainingLib.getModules(trainingModules)
  };

  // ── Fully public query ──────────────────────────────────────────────────────

  public query func getLiveSessions() : async [TrainingTypes.LiveSession] {
    TrainingLib.getSessions(liveSessions)
  };

  // ── Admin updates (RBAC: CanManageTraining) ─────────────────────────────────

  public shared ({ caller }) func adminGetTrainingModules() : async [TrainingTypes.TrainingModule] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageTraining);
    TrainingLib.getModules(trainingModules)
  };

  public shared ({ caller }) func adminCreateTrainingModule(
    title : Text,
    description : Text,
    videoStorageId : ?Text,
    textContent : Text,
    order : Nat,
  ) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageTraining);
    TrainingLib.createModule(trainingModules, nextModuleId, title, description, videoStorageId, textContent, order, Time.now());
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminCreateTrainingModule", title, Time.now())
  };

  public shared ({ caller }) func adminUpdateTrainingModule(
    id : Nat,
    title : Text,
    description : Text,
    videoStorageId : ?Text,
    textContent : Text,
    order : Nat,
  ) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageTraining);
    TrainingLib.updateModule(trainingModules, id, title, description, videoStorageId, textContent, order);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminUpdateTrainingModule", id.toText(), Time.now())
  };

  public shared ({ caller }) func adminDeleteTrainingModule(id : Nat) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageTraining);
    TrainingLib.deleteModule(trainingModules, id);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminDeleteTrainingModule", id.toText(), Time.now())
  };

  public shared ({ caller }) func adminCreateLiveSession(
    title : Text,
    description : Text,
    date : Int,
    joinLink : Text,
  ) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageTraining);
    TrainingLib.createSession(liveSessions, nextSessionId, title, description, date, joinLink, Time.now());
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminCreateLiveSession", title, Time.now())
  };

  public shared ({ caller }) func adminUpdateLiveSession(
    id : Nat,
    title : Text,
    description : Text,
    date : Int,
    joinLink : Text,
  ) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageTraining);
    TrainingLib.updateSession(liveSessions, id, title, description, date, joinLink);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminUpdateLiveSession", id.toText(), Time.now())
  };

  public shared ({ caller }) func adminDeleteLiveSession(id : Nat) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageTraining);
    TrainingLib.deleteSession(liveSessions, id);
    RolesLib.logActivity(activityLog, nextLogId, caller, RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }), "adminDeleteLiveSession", id.toText(), Time.now())
  };
};
