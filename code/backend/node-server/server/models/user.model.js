import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    primaryPhone: { type: String, required: false, unique: false },
    firebaseUid: { type: String, index: { unique: true, sparse: true } },
    password: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    chats: { type: Array, default: [] },
    // Field for the human-readable address string from the reverse geocoding API.
    farmAddress: {
      type: String,
    },
    // GeoJSON object for storing coordinates, enabling geospatial queries.
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },

    crops: {
      type: Array, 
      default: [],
    },
    role: {
      type: String,
      enum: ["farmer", "admin"],
      default: "farmer",
    },
  },
  { timestamps: true }
);

// Enable the 2dsphere index for efficient geospatial queries (e.g., finding users within a certain radius).
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
