import Types "../types/training";
import List "mo:core/List";

module {
  // ── Training modules ────────────────────────────────────────────────────────

  public func getModules(modules : List.List<Types.TrainingModule>) : [Types.TrainingModule] {
    modules.toArray()
  };

  public func createModule(
    modules : List.List<Types.TrainingModule>,
    nextId : { var value : Nat },
    title : Text,
    description : Text,
    videoStorageId : ?Text,
    textContent : Text,
    order : Nat,
    nowNanos : Int,
  ) {
    let id = nextId.value;
    nextId.value += 1;
    modules.add({
      id;
      title;
      description;
      videoStorageId;
      textContent;
      order;
      createdAt = nowNanos;
    });
  };

  public func updateModule(
    modules : List.List<Types.TrainingModule>,
    id : Nat,
    title : Text,
    description : Text,
    videoStorageId : ?Text,
    textContent : Text,
    order : Nat,
  ) {
    modules.mapInPlace(func(m) {
      if (m.id == id) {
        { m with title; description; videoStorageId; textContent; order }
      } else { m }
    });
  };

  public func deleteModule(
    modules : List.List<Types.TrainingModule>,
    id : Nat,
  ) {
    let kept = modules.filter(func(m) { m.id != id });
    modules.clear();
    modules.append(kept);
  };

  // ── Live sessions ───────────────────────────────────────────────────────────

  public func getSessions(sessions : List.List<Types.LiveSession>) : [Types.LiveSession] {
    sessions.toArray()
  };

  public func createSession(
    sessions : List.List<Types.LiveSession>,
    nextId : { var value : Nat },
    title : Text,
    description : Text,
    date : Int,
    joinLink : Text,
    nowNanos : Int,
  ) {
    let id = nextId.value;
    nextId.value += 1;
    sessions.add({
      id;
      title;
      description;
      date;
      joinLink;
      createdAt = nowNanos;
    });
  };

  public func updateSession(
    sessions : List.List<Types.LiveSession>,
    id : Nat,
    title : Text,
    description : Text,
    date : Int,
    joinLink : Text,
  ) {
    sessions.mapInPlace(func(s) {
      if (s.id == id) {
        { s with title; description; date; joinLink }
      } else { s }
    });
  };

  public func deleteSession(
    sessions : List.List<Types.LiveSession>,
    id : Nat,
  ) {
    let kept = sessions.filter(func(s) { s.id != id });
    sessions.clear();
    sessions.append(kept);
  };
};
