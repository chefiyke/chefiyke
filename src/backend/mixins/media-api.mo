import MediaTypes "../types/media";
import RolesTypes "../types/roles";
import SecurityTypes "../types/security";
import MediaLib "../lib/media";
import RolesLib "../lib/roles";
import SecurityLib "../lib/security";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

// Public and admin API for gallery images and videos.
// Admin functions require CanManageMedia permission (enforced via RBAC).
// Rate-limited: max 10 media write operations per principal per minute.
// Public query functions are accessible to all.
mixin (
  galleryImages : List.List<MediaTypes.GalleryImage>,
  galleryVideos : List.List<MediaTypes.GalleryVideo>,
  nextImageId : { var value : Nat },
  nextVideoId : { var value : Nat },
  roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
  activityLog : List.List<RolesTypes.ActivityLog>,
  nextLogId : { var value : Nat },
  rateLimits : Map.Map<Text, SecurityTypes.RateLimitEntry>,
  blockedKeys : Map.Map<Text, SecurityTypes.BlockEntry>,
) {
  let MEDIA_RATE_LIMIT : Nat = 10;

  // Check and record a rate-limit event; traps with a safe message if exceeded.
  func mediaRateCheck(caller : Principal) {
    let key = "media:" # caller.toText();
    let now = Time.now();
    switch (SecurityLib.firewallCheck(blockedKeys, rateLimits, key, MEDIA_RATE_LIMIT, now)) {
      case (#allow) {
        SecurityLib.recordRequest(rateLimits, key, now);
      };
      case (#rateLimited(msg)) {
        RolesLib.logActivity(
          activityLog,
          nextLogId,
          caller,
          RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }),
          "mediaRateLimit",
          key,
          now,
        );
        Runtime.trap(msg);
      };
      case (#blocked(msg)) {
        Runtime.trap(msg);
      };
    };
  };

  // ── Public queries ────────────────────────────────────────────────────────────────────────

  public query func getGalleryImages() : async [MediaTypes.GalleryImage] {
    MediaLib.getImages(galleryImages)
  };

  // Returns only isVisible=true videos for public use
  public query func getGalleryVideos() : async [MediaTypes.GalleryVideo] {
    MediaLib.getVisibleVideos(galleryVideos)
  };

  // ── Admin updates (RBAC: CanManageMedia) ─────────────────────────────────────────────

  public shared ({ caller }) func adminGetGalleryImages() : async [MediaTypes.GalleryImage] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageMedia);
    MediaLib.getImages(galleryImages)
  };

  public shared ({ caller }) func adminAddGalleryImage(
    storageId : Text,
    caption : Text,
  ) : async { #ok; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageMedia);
    mediaRateCheck(caller);
    let result = MediaLib.addImage(galleryImages, nextImageId, storageId, caption, Time.now());
    switch (result) {
      case (#ok) {
        RolesLib.logActivity(
          activityLog, nextLogId, caller,
          RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }),
          "adminAddGalleryImage", storageId, Time.now(),
        );
      };
      case (#err _) {};
    };
    result
  };

  public shared ({ caller }) func adminDeleteGalleryImage(id : Nat) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageMedia);
    mediaRateCheck(caller);
    MediaLib.deleteImage(galleryImages, id);
    RolesLib.logActivity(
      activityLog, nextLogId, caller,
      RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }),
      "adminDeleteGalleryImage", id.toText(), Time.now(),
    );
  };

  // Returns all videos (including OFF) for admin use
  public shared ({ caller }) func adminGetGalleryVideos() : async [MediaTypes.GalleryVideo] {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageMedia);
    MediaLib.getAllVideos(galleryVideos)
  };

  public shared ({ caller }) func adminAddGalleryVideo(
    input : MediaTypes.GalleryVideoInput,
  ) : async { #ok : MediaTypes.GalleryVideo; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageMedia);
    mediaRateCheck(caller);
    let result = MediaLib.addVideo(galleryVideos, nextVideoId, input, Time.now());
    switch (result) {
      case (#ok(v)) {
        RolesLib.logActivity(
          activityLog, nextLogId, caller,
          RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }),
          "adminAddGalleryVideo", v.url, Time.now(),
        );
      };
      case (#err _) {};
    };
    result
  };

  public shared ({ caller }) func adminEditGalleryVideo(
    id : Nat,
    input : MediaTypes.GalleryVideoInput,
  ) : async { #ok : MediaTypes.GalleryVideo; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageMedia);
    mediaRateCheck(caller);
    let result = MediaLib.editVideo(galleryVideos, id, input);
    switch (result) {
      case (#ok(v)) {
        RolesLib.logActivity(
          activityLog, nextLogId, caller,
          RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }),
          "adminEditGalleryVideo", id.toText(), Time.now(),
        );
      };
      case (#err _) {};
    };
    result
  };

  public shared ({ caller }) func adminToggleGalleryVideoVisibility(
    id : Nat,
  ) : async { #ok : MediaTypes.GalleryVideo; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageMedia);
    mediaRateCheck(caller);
    let result = MediaLib.toggleVideoVisibility(galleryVideos, id);
    switch (result) {
      case (#ok(v)) {
        RolesLib.logActivity(
          activityLog, nextLogId, caller,
          RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }),
          "adminToggleGalleryVideoVisibility", id.toText(), Time.now(),
        );
      };
      case (#err _) {};
    };
    result
  };

  public shared ({ caller }) func adminToggleGalleryVideoFeatured(
    id : Nat,
  ) : async { #ok : MediaTypes.GalleryVideo; #err : Text } {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageMedia);
    mediaRateCheck(caller);
    let result = MediaLib.toggleVideoFeatured(galleryVideos, id);
    switch (result) {
      case (#ok(v)) {
        RolesLib.logActivity(
          activityLog, nextLogId, caller,
          RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }),
          "adminToggleGalleryVideoFeatured", id.toText(), Time.now(),
        );
      };
      case (#err _) {};
    };
    result
  };

  public shared ({ caller }) func adminDeleteGalleryVideo(id : Nat) : async () {
    RolesLib.bootstrapOwnerIfNeeded(roleUsers, caller, Time.now());
    RolesLib.requirePermission(roleUsers, caller, #CanManageMedia);
    mediaRateCheck(caller);
    MediaLib.deleteVideo(galleryVideos, id);
    RolesLib.logActivity(
      activityLog, nextLogId, caller,
      RolesLib.getRole(roleUsers, caller) |> (switch _ { case (?r) r; case null #Customer }),
      "adminDeleteGalleryVideo", id.toText(), Time.now(),
    );
  };
};
