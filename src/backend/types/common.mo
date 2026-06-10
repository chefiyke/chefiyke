module {
  public type Timestamp = Int; // nanoseconds from Time.now()
  public type IpAddress = Text; // string representation of caller IP / principal key

  public type SubmitResult = {
    #ok : Text;
    #err : Text;
  };
};
