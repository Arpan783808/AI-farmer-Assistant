import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    primaryPhone: { type: String, required: false, unique: true },
    email: { type: String, required: false, unique: true },
    firebaseUid: { type: String, index: { unique: true, sparse: true } }, 
    password: { type: String }, // option for phone login
    isPhoneVerified: { type: Boolean, default: false },
    profilePicture: {
        type: String,
        default:
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
