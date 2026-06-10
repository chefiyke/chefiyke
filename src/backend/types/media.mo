import CommonTypes "common";

module {
  // Gallery image stored via object-storage extension
  public type GalleryImage = {
    id : Nat;
    storageId : Text; // object-storage reference
    caption : Text;
    uploadedAt : CommonTypes.Timestamp;
  };

  // Gallery video — external URL only (YouTube, Instagram, TikTok, Facebook, any video URL)
  public type GalleryVideo = {
    id : Nat;
    url : Text; // external video link
    title : Text;
    description : Text;
    isVisible : Bool;
    isFeatured : Bool;
    uploadedAt : CommonTypes.Timestamp;
  };

  public type GalleryVideoInput = {
    url : Text;
    title : Text;
    description : Text;
    isVisible : Bool;
    isFeatured : Bool;
  };
};
