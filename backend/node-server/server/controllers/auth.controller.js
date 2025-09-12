import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";

async function makeUniqueUsername(base) {
  let name = base;
  let i = 0;
  while (await User.findOne({ username: name })) {
    i++;
    name = `${base}${i}`;
  }
  return name;
}

export const signin = async (req, res) => {
  const { idToken, username } = req.body;
  if (!idToken) return res.status(400).json({ error: "idToken missing" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decoded.phone_number;
    const uid = decoded.uid;

    if (!phoneNumber) return res.status(400).json({ error: "No phone in token" });
    let user = await User.findOne({ firebaseUid: uid }) || await User.findOne({ primaryPhone: phoneNumber });

    if (!user) {
      let baseUsername = username || phoneNumber.replace(/\D/g, "");
      baseUsername = baseUsername.slice(0, 20);
      const uniqueUsername = await makeUniqueUsername(baseUsername);

      const randomPassword = crypto.randomBytes(12).toString("hex");
      const hashed = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        username: uniqueUsername,
        primaryPhone: phoneNumber,
        password: hashed,
        firebaseUid: uid,
        isPhoneVerified: true,
      });
    } else {
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.isPhoneVerified = true;
        await user.save();
      }
    }
    const expiresIn = 5 * 24 * 60 * 60 * 1000; 
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    const publicUser = {
      id: user._id,
      username: user.username,
      primaryPhone: user.primaryPhone,
      profilePicture: user.profilePicture,
      isPhoneVerified: user.isPhoneVerified,
    };

    res.json({ user: publicUser });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export const checkSession = async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: { id: user._id, username: user.username, primaryPhone: user.primaryPhone } });
  } catch (err) {
    return res.status(401).json({ error: "Invalid session" });
  }
}

export const logout = async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    await admin.auth().revokeRefreshTokens(decoded.uid);
  } catch (e) {
  }
  res.clearCookie("session");
  res.json({ ok: true });
}