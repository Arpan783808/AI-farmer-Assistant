import admin from "firebase-admin"; 
import User from "../models/user.model.js"; 

const verifySession = async (req, res, next) => {
    // console.log(req.cookies.session);
  const sessionCookie = req.cookies.session || "";
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    const user = await User.findOne({ firebaseUid: decodedClaims.uid });
    // console.log(decodedClaims);
    if (!user) {
      console.error("User not found in MongoDB for UID:", decodedClaims.uid);
      return res.status(401).json({ error: "User not found" });
    }
    req.user = {
      firebaseUid: decodedClaims.uid,
      role: decodedClaims.role || user.role, 
      _id: user._id, 
    };

    next();
  } catch (err) {
    console.error("Session verification error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default verifySession;