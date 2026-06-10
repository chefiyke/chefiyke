module {
  // Tracks request timestamps per IP/principal key for rate-limiting
  public type RateLimitEntry = {
    var timestamps : [Int]; // nanosecond timestamps of recent submissions
  };

  // Blocked IPs/principals
  public type BlockEntry = {
    key : Text;
    reason : Text;
    blockedAt : Int;
  };

  public type FirewallVerdict = {
    #allow;
    #rateLimited : Text;
    #blocked : Text;
  };
};
