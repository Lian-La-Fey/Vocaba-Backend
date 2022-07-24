import express from "express";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post("/", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).send({ message: "Incorrect email or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(400).send({ message: "Incorrect email or password" });

        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: "10d" }
        );
        res.status(200).send({ result: user, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
});

export default router;
