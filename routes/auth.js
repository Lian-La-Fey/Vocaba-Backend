import express from "express";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { Token } from "../models/Token.js";
import crypto from "crypto";

const router = express.Router();

router.post("/", { 'Content-Type': 'application/json' }, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).send({ message: "Email is not registered" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).send({ message: "Incorrect email or password" });

    if (!user.verified) {
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const url = `${process.env.CLIENT_URL}/users/${user.id}/verify/${token.token}`;
        await sendEmail(user.email, "Verify Email", url);
      }

      return res
        .status(400)
        .send({ message: "An email sent to your account please verify" });
    }

    user.password = undefined;
    user.__v = undefined;

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_PRIVATE_KEY,
      { expiresIn: "10d" }
    );

    res.status(200).send({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
});

export default router;
