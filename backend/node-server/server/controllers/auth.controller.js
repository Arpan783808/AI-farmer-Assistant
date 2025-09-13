import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import admin from "firebase-admin";

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
  console.log("entered");
  const { idToken, username, login } = req.body;

  if (!idToken) return res.status(400).json({ error: "idToken missing" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decoded.phone_number;
    const uid = decoded.uid;
    if (!phoneNumber)
      return res.status(400).json({ error: "No phone in token" });
    let user =
      (await User.findOne({ firebaseUid: uid })) ||
      (await User.findOne({ primaryPhone: phoneNumber }));
    console.log(user);
    if (!user) {
      if (login) {
        return res.status(404).json({ message: "User not found." });
      }
      let baseUsername = username || phoneNumber.replace(/\D/g, "");
      baseUsername = baseUsername.slice(0, 20);
      const uniqueUsername = await makeUniqueUsername(baseUsername);

      const randomPassword = crypto.randomBytes(12).toString("hex");
      const hashed = await bcrypt.hash(randomPassword, 10);
      const { farmAddress, longitude, latitude } = req.body;
      user = await User.create({
        username: uniqueUsername,
        primaryPhone: phoneNumber,
        password: hashed,
        firebaseUid: uid,
        isPhoneVerified: true,
        farmAddress: farmAddress,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      });
    } else {
      if (!login) {
        return res.status(404).json({ message: "user already exisits" });
      }
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.isPhoneVerified = true;
        await user.save();
        console.log(9);
      }
    }
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });
    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: false,
      sameSite: "None",
    });
    const publicUser = {
      id: user._id,
      username: user.username,
      primaryPhone: user.primaryPhone,
      profilePicture: user.profilePicture,
      isPhoneVerified: user.isPhoneVerified,
      farmAddress: user.farmAddress,
    };
    res.json({
      token: sessionCookie,
      user: publicUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const google = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "idToken missing" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;
    const uid = decoded.uid;
    const name = decoded.name || email.split("@")[0];
    const googlePhotoUrl = decoded.picture;

    let user =
      (await User.findOne({ firebaseUid: uid })) ||
      (await User.findOne({ email }));

    if (!user) {
      const baseUsername = name.toLowerCase().replace(/\s+/g, "").slice(0, 20);
      const uniqueUsername = await makeUniqueUsername(baseUsername);

      const randomPassword = crypto.randomBytes(12).toString("hex");
      const hashed = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        username: uniqueUsername,
        email,
        password: hashed,
        firebaseUid: uid,
        profilePicture: googlePhotoUrl,
        isPhoneVerified: decoded.email_verified || false,
      });
    } else if (!user.firebaseUid) {
      user.firebaseUid = uid;
      await user.save();
    }

    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: false,
      sameSite: "None",
    });

    const publicUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    };

    res.json({ token: sessionCookie, user: publicUser });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const checkSession = async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  try {
    const decodedClaims = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      user: {
        id: user._id,
        username: user.username,
        primaryPhone: user.primaryPhone,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid session" });
  }
};
export const checkPhone = async (req, res) => {
  const { phone } = req.body;
  try {
    let user = await User.findOne({ primaryPhone: phone });
    if (user) return res.status(404).json({ message: "user already exisits" });
    return res.status(200).json({ message: "user not found" });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
export const logout = async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    await admin.auth().revokeRefreshTokens(decoded.uid);
  } catch (e) {}
  res.clearCookie("session");
  res.json({ ok: true });
};
