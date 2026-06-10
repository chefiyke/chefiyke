import CommonTypes "common";

module {
  // ── Consulting tier variants ─────────────────────────────────────────────────

  public type ConsultingTier = {
    #BusinessDevelopment;
    #Advisory;
    #BakerySetup;
    #BakerySetupAndRecipes;
  };

  // ── Project status variants ──────────────────────────────────────────────────

  public type ClientProjectStatus = {
    #Pending;
    #InProgress;
    #UnderReview;
    #Completed;
    #OnHold;
  };

  // ── Sub-entities ─────────────────────────────────────────────────────────────

  public type Deliverable = {
    id : Text;
    title : Text;
    description : Text;
    url : ?Text;
    fileType : ?Text;
    isAvailable : Bool;
    uploadedAt : CommonTypes.Timestamp;
  };

  public type ProjectUpdate = {
    id : Text;
    title : Text;
    content : Text;
    createdAt : CommonTypes.Timestamp;
    isPublished : Bool;
  };

  public type NextStep = {
    id : Text;
    description : Text;
    isCompleted : Bool;
    order : Nat;
  };

  // ── Core project record ──────────────────────────────────────────────────────

  public type ClientProject = {
    id : Text;
    clientPrincipal : Principal;
    clientName : Text;
    clientEmail : Text;
    tier : ConsultingTier;
    projectTitle : Text;
    projectDescription : Text;
    status : ClientProjectStatus;
    startDate : CommonTypes.Timestamp;
    expectedEndDate : ?CommonTypes.Timestamp;
    completedDate : ?CommonTypes.Timestamp;
    deliverables : [Deliverable];
    updates : [ProjectUpdate];
    nextSteps : [NextStep];
    createdAt : CommonTypes.Timestamp;
    updatedAt : CommonTypes.Timestamp;
  };

  // ── Request types ─────────────────────────────────────────────────────────────

  public type CreateProjectRequest = {
    clientPrincipal : Principal;
    clientName : Text;
    clientEmail : Text;
    tier : ConsultingTier;
    projectTitle : Text;
    projectDescription : Text;
    startDate : CommonTypes.Timestamp;
    expectedEndDate : ?CommonTypes.Timestamp;
  };

  public type UpdateProjectRequest = {
    projectTitle : ?Text;
    projectDescription : ?Text;
    status : ?ClientProjectStatus;
    expectedEndDate : ?CommonTypes.Timestamp;
    completedDate : ?CommonTypes.Timestamp;
  };
};
