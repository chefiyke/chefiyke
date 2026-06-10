import SecurityTypes "../types/security";
import Map "mo:core/Map";
import Array "mo:core/Array";

module {
  // One minute in nanoseconds
  let ONE_MINUTE_NS : Int = 60_000_000_000;

  // ── Rate limiting ────────────────────────────────────────────────────────────

  public func checkRateLimit(
    rateLimits : Map.Map<Text, SecurityTypes.RateLimitEntry>,
    key : Text,
    maxPerMinute : Nat,
    nowNanos : Int,
  ) : SecurityTypes.FirewallVerdict {
    let cutoff = nowNanos - ONE_MINUTE_NS;
    switch (rateLimits.get(key)) {
      case null { #allow };
      case (?entry) {
        // Count timestamps within the last minute
        let recent = entry.timestamps.filter(func(t : Int) : Bool { t > cutoff });
        if (recent.size() >= maxPerMinute) {
          #rateLimited("Too many requests. Please wait before trying again.")
        } else {
          #allow
        }
      };
    }
  };

  public func recordRequest(
    rateLimits : Map.Map<Text, SecurityTypes.RateLimitEntry>,
    key : Text,
    nowNanos : Int,
  ) {
    let cutoff = nowNanos - ONE_MINUTE_NS;
    switch (rateLimits.get(key)) {
      case null {
        // First request from this key
        rateLimits.add(key, { var timestamps = [nowNanos] })
      };
      case (?entry) {
        // Keep only recent timestamps and add the new one
        let recent = entry.timestamps.filter(func(t : Int) : Bool { t > cutoff });
        entry.timestamps := recent.concat([nowNanos])
      };
    }
  };

  // ── Blocked keys ─────────────────────────────────────────────────────────────

  public func isBlocked(
    blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
    key : Text,
  ) : Bool {
    switch (blockedKeys.get(key)) {
      case null { false };
      case (?_) { true };
    }
  };

  public func blockKey(
    blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
    key : Text,
    reason : Text,
    nowNanos : Int,
  ) {
    blockedKeys.add(key, { key; reason; blockedAt = nowNanos })
  };

  public func unblockKey(
    blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
    key : Text,
  ) {
    blockedKeys.remove(key)
  };

  // ── Combined firewall check ──────────────────────────────────────────────────

  public func firewallCheck(
    blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
    rateLimits : Map.Map<Text, SecurityTypes.RateLimitEntry>,
    key : Text,
    maxPerMinute : Nat,
    nowNanos : Int,
  ) : SecurityTypes.FirewallVerdict {
    if (isBlocked(blockedKeys, key)) {
      return #blocked("Your access has been blocked due to suspicious activity.")
    };
    checkRateLimit(rateLimits, key, maxPerMinute, nowNanos)
  };

  // ── Admin helpers ────────────────────────────────────────────────────────────

  public func getBlockedKeys(
    blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
  ) : [SecurityTypes.BlockEntry] {
    blockedKeys.values().toArray()
  };
};
