import Types "../types/media";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

module {
  // ── Validation helpers ────────────────────────────────────────────────────────────────────────

  // Allow only http:// and https:// — blocks javascript:, data:, file:, vbscript:, etc.
  public func validateUrl(url : Text) : { #ok; #err : Text } {
    if (url.size() == 0) {
      return #err("URL is required.");
    };
    let lower = url.toLower();
    if (
      lower.startsWith(#text "javascript:") or
      lower.startsWith(#text "data:") or
      lower.startsWith(#text "file:") or
      lower.startsWith(#text "vbscript:")
    ) {
      return #err("Invalid URL. Only http and https links are allowed.");
    };
    if (not (lower.startsWith(#text "http://") or lower.startsWith(#text "https://"))) {
      return #err("Invalid URL. Only http and https links are allowed.");
    };
    #ok
  };

  // Storage ID: alphanumeric, hyphens, underscores only; 1–255 chars.
  public func validateStorageId(id : Text) : { #ok; #err : Text } {
    let n = id.size();
    if (n == 0 or n > 255) {
      return #err("Storage ID must be between 1 and 255 characters.");
    };
    let valid = id.toArray().all(func(c : Char) : Bool {
      (c >= 'a' and c <= 'z') or
      (c >= 'A' and c <= 'Z') or
      (c >= '0' and c <= '9') or
      c == '-' or c == '_'
    });
    if (not valid) {
      return #err("Storage ID may only contain letters, digits, hyphens, and underscores.");
    };
    #ok
  };

  // Trim whitespace; reject empty after trim; enforce max 500 chars.
  public func sanitizeText(value : Text, fieldName : Text) : { #ok : Text; #err : Text } {
    let trimmed = value.trim(#predicate(func(c : Char) : Bool {
      c == ' ' or c == '\t' or c == '\n' or c == '\r'
    }));
    if (trimmed.size() == 0) {
      return #err(fieldName # " cannot be empty.");
    };
    if (trimmed.size() > 500) {
      return #err(fieldName # " must be 500 characters or fewer.");
    };
    #ok(trimmed)
  };

  // ── Gallery images ────────────────────────────────────────────────────────────────────────

  public func getImages(images : List.List<Types.GalleryImage>) : [Types.GalleryImage] {
    images.toArray()
  };

  public func addImage(
    images : List.List<Types.GalleryImage>,
    nextId : { var value : Nat },
    storageId : Text,
    caption : Text,
    nowNanos : Int,
  ) : { #ok; #err : Text } {
    switch (validateStorageId(storageId)) {
      case (#err(e)) { return #err(e) };
      case (#ok) {};
    };
    let cleanCaption = switch (sanitizeText(caption, "Caption")) {
      case (#err(e)) { return #err(e) };
      case (#ok(v)) { v };
    };
    let id = nextId.value;
    nextId.value += 1;
    images.add({
      id;
      storageId;
      caption = cleanCaption;
      uploadedAt = nowNanos;
    });
    #ok
  };

  public func deleteImage(
    images : List.List<Types.GalleryImage>,
    id : Nat,
  ) {
    let kept = images.filter(func(img) { img.id != id });
    images.clear();
    images.append(kept);
  };

  // ── Gallery videos ────────────────────────────────────────────────────────────────────────

  // Return only visible videos for public consumption
  public func getVisibleVideos(videos : List.List<Types.GalleryVideo>) : [Types.GalleryVideo] {
    videos.filter(func(v) { v.isVisible }).toArray()
  };

  // Return all videos for admin use
  public func getAllVideos(videos : List.List<Types.GalleryVideo>) : [Types.GalleryVideo] {
    videos.toArray()
  };

  public func addVideo(
    videos : List.List<Types.GalleryVideo>,
    nextId : { var value : Nat },
    input : Types.GalleryVideoInput,
    nowNanos : Int,
  ) : { #ok : Types.GalleryVideo; #err : Text } {
    switch (validateUrl(input.url)) {
      case (#err(e)) { return #err(e) };
      case (#ok) {};
    };
    let cleanTitle = switch (sanitizeText(input.title, "Title")) {
      case (#err(e)) { return #err(e) };
      case (#ok(v)) { v };
    };
    // Description is optional — only sanitize if non-empty
    let cleanDesc : Text = if (input.description.size() == 0) {
      ""
    } else {
      switch (sanitizeText(input.description, "Description")) {
        case (#err(e)) { return #err(e) };
        case (#ok(v)) { v };
      }
    };
    // If featured, clear isFeatured on all others first
    if (input.isFeatured) {
      videos.mapInPlace(func(v) { { v with isFeatured = false } });
    };
    let id = nextId.value;
    nextId.value += 1;
    let video : Types.GalleryVideo = {
      id;
      url = input.url;
      title = cleanTitle;
      description = cleanDesc;
      isVisible = input.isVisible;
      isFeatured = input.isFeatured;
      uploadedAt = nowNanos;
    };
    videos.add(video);
    #ok(video)
  };

  public func editVideo(
    videos : List.List<Types.GalleryVideo>,
    id : Nat,
    input : Types.GalleryVideoInput,
  ) : { #ok : Types.GalleryVideo; #err : Text } {
    switch (validateUrl(input.url)) {
      case (#err(e)) { return #err(e) };
      case (#ok) {};
    };
    let cleanTitle = switch (sanitizeText(input.title, "Title")) {
      case (#err(e)) { return #err(e) };
      case (#ok(v)) { v };
    };
    let cleanDesc : Text = if (input.description.size() == 0) {
      ""
    } else {
      switch (sanitizeText(input.description, "Description")) {
        case (#err(e)) { return #err(e) };
        case (#ok(v)) { v };
      }
    };
    var found = false;
    var updated : ?Types.GalleryVideo = null;
    // If setting featured, clear isFeatured on all others first
    if (input.isFeatured) {
      videos.mapInPlace(func(v) {
        if (v.id == id) { v } else { { v with isFeatured = false } }
      });
    };
    videos.mapInPlace(func(v) {
      if (v.id == id) {
        found := true;
        let u : Types.GalleryVideo = {
          id;
          url = input.url;
          title = cleanTitle;
          description = cleanDesc;
          isVisible = input.isVisible;
          isFeatured = input.isFeatured;
          uploadedAt = v.uploadedAt;
        };
        updated := ?u;
        u
      } else { v }
    });
    if (not found) { return #err("Video not found.") };
    switch (updated) {
      case (?u) #ok(u);
      case null #err("Operation failed. Please try again.");
    }
  };

  public func toggleVideoVisibility(
    videos : List.List<Types.GalleryVideo>,
    id : Nat,
  ) : { #ok : Types.GalleryVideo; #err : Text } {
    var found = false;
    var updated : ?Types.GalleryVideo = null;
    videos.mapInPlace(func(v) {
      if (v.id == id) {
        found := true;
        let u = { v with isVisible = not v.isVisible };
        updated := ?u;
        u
      } else { v }
    });
    if (not found) { return #err("Video not found.") };
    switch (updated) {
      case (?u) #ok(u);
      case null #err("Operation failed. Please try again.");
    }
  };

  public func toggleVideoFeatured(
    videos : List.List<Types.GalleryVideo>,
    id : Nat,
  ) : { #ok : Types.GalleryVideo; #err : Text } {
    var found = false;
    // Set isFeatured=false on all first, then true on the target
    videos.mapInPlace(func(v) { { v with isFeatured = false } });
    var updated : ?Types.GalleryVideo = null;
    videos.mapInPlace(func(v) {
      if (v.id == id) {
        found := true;
        let u = { v with isFeatured = true };
        updated := ?u;
        u
      } else { v }
    });
    if (not found) { return #err("Video not found.") };
    switch (updated) {
      case (?u) #ok(u);
      case null #err("Operation failed. Please try again.");
    }
  };

  public func deleteVideo(
    videos : List.List<Types.GalleryVideo>,
    id : Nat,
  ) {
    let kept = videos.filter(func(v) { v.id != id });
    videos.clear();
    videos.append(kept);
  };
};
