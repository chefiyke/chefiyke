module {
  // ── System App ───────────────────────────────────────────────────────────────
  public type SystemApp = {
    id : Text;
    name : Text;
    description : Text;
    url : Text;
    isVisible : Bool;
    order : Nat;
    createdAt : Int;
  };

  // ── Aggregate ─────────────────────────────────────────────────────────────────
  public type SystemsData = {
    apps : [SystemApp];
  };
};
