import CommonTypes "common";

module {
  // A training module — may optionally include a video
  public type TrainingModule = {
    id : Nat;
    title : Text;
    description : Text;
    videoStorageId : ?Text; // null if text-only module
    textContent : Text;
    order : Nat; // display sort order
    createdAt : CommonTypes.Timestamp;
  };

  // A scheduled live session
  public type LiveSession = {
    id : Nat;
    title : Text;
    description : Text;
    date : CommonTypes.Timestamp; // scheduled start time in nanoseconds
    joinLink : Text; // external video platform join URL
    createdAt : CommonTypes.Timestamp;
  };
};
