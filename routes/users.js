import {passwordComplexity, User, validate, validateSingleList} from '../models/User.js'
import bcrypt from 'bcrypt'
import express from 'express';
import validateObjectId from '../middleware/validateObjectId.js'
import auth from '../middleware/authentication.js';
import { Word } from '../models/Word.js';
import { sendEmail } from '../utils/sendEmail.js';
import { Token } from '../models/Token.js';
import crypto from 'crypto';
import Joi from 'joi';

const router = express.Router()

//-----------------------------------------------------------------------------------
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -__v")
        res.status(200).send(user)
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server Error" })
    }
})


// create user
router.post('/', async (req, res) => {
    
    try {
        const { error } = validate(req.body)
        if( error ) 
            return res.status(400).send({ message: error.details[0].message })
            
        const { userName, email, password } = req.body;

        const user = await User.findOne({$or:[{userName: userName}, {email: email}]})
        if ( user )
            return res.status(400).send({ message: 'User already exists with this user name or email' })
        
            
        const hash = await bcrypt.hash(password, Number(process.env.SALT));
        const newUser = new User({ ...req.body, password: hash })
        
        
        const token = new Token({ userId: newUser._id, token: crypto.randomBytes(32).toString("hex")})
        await token.save();
        
        const url = `${process.env.CLIENT_URL}/users/${newUser._id}/verify/${token.token}`;
        await sendEmail(newUser.email, "Verify Email", url);
        
        await newUser.save()
        res.status(200).send({result: newUser})
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server Error" })
    }
})

// update user info
router.patch('/:id', [validateObjectId, auth], async (req, res) => {
    try {
        const { id } = req.params
        const { error } = validate(req.body)
        if( error ) 
            return res.status(400).send({ message: error.details[0].message })
        const { password, userName, email } = req.body
        const registered = await User.findOne({$or:[{userName: userName}, {email: email}]})
        if ( registered && registered.id !== id )
            return res.status(400).send({ message: "This user is already registered." })
            
        const user = await User.findById(id)
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(400).send({ message: "Incorrect password" });
        user.userName = userName
        user.email = email
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        console.log(error);
        res.status(404).send({message: "Failed"})
    }
})

// change password
router.put('/:id', [validateObjectId, auth], async (req, res) => {
    try {
        const { current, newPassword } = req.body
        const user = await User.findById(req.params.id)
        const match = await bcrypt.compare(current, user.password);
        if (!match)
            return res.status(400).send({ message: "Incorrect password" });
        const updatedUser = {
            userName: user.userName,
            email: user.email,
            password: newPassword,
        }
        const { error } = validate(updatedUser)
        if ( error )
            return res.status(400).send({ message: error.details[0].message });
        const hash = await bcrypt.hash(newPassword, Number(process.env.SALT));
        user.password = hash
        await user.save()
        user.password = undefined
        res.status(200).send(user)
    } catch (error) {
        console.log(error);
        res.status(404).send({message: "Failed"})
    }
})

router.delete('/:id', [validateObjectId], async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        await Word.deleteMany({user: req.params.id})
        user.delete()
        res.status(200).send({ message: 'Successfull Deletion' })
    } catch (error) {
        res.status(404).send({ message: "User couldn't deleted"})
    }
})

//---------------------------------------------------------------------------------------

// verify email
router.get("/:id/verify/:token/", async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if ( !user )
            return res.status(404).send({ message: "User Not Found" })
            
        const token = await Token.findOne({ 
            userId: id,
            token: req.params.token 
        })
        if (!token) 
            return res.status(400).send({ message: "Token Not found!" });
        
        await User.findByIdAndUpdate(id, { $set: { verified: true }})
        await Token.deleteMany({ userId: id })
        
        res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// generate password link
router.post("/password-link", async (req, res) => {
    try {
        const emailSchema = Joi.object({
            email: Joi.string().email().required()
        })
        
        const { error } = emailSchema.validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });
            
        let user = await User.findOne({ email: req.body.email });
        if ( !user )
            return res.status(406).send({ message: "User with given email does not exist!" })
        
        let token = await Token.findOne({ userId: user._id });
        if ( !token ) {
            token = new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex")
            })
            await token.save()
        }
        
        const url = `${process.env.CLIENT_URL}/reset-password/${user._id}/${token.token}`;
        await sendEmail(user.email, "Password Reset", url);
        
        res.status(200).send({ message: "Password reset link sent to your email account" })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
})

// verify password link
router.get("/:id/:token", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if ( !user )
            return res.status(400).send({ message: "Invalid Link" })
        
        const token = await Token.findOne({ 
            userId: req.params.id, 
            token: req.params.token 
        })
        if ( !token )
            return res.status(400).send({ message: "Invalid Link" })
        
        res.status(200).send("Valid Url");
    } catch(error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.post("/reset-password/:id/:token", async (req, res) => {
    try {
        const passwordSchema = Joi.object({ password: passwordComplexity })
        const { error } = passwordSchema.validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });
        
        const user = await User.findById(req.params.id);
        if ( !user ) 
            return res.status(400).send({ message: "Invalid link" });
        
        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token
        })
        if ( !token ) 
            return res.status(400).send({ message: "Invalid Link" });
        
        if (!user.verified) 
            user.verified = true;
        
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        
        user.password = hashPassword;
        await user.save();
        await token.remove();
        
        res.status(200).send({ message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
    
});


//--------------------------------------------------------------------------------

// create list
router.put('/createList/:id', auth, async (req, res) => {
    try {
        const { error } = validateSingleList(req.body)
        if( error ) 
            return res.status(400).send({ message: error.details[0].message })
        const { id } = req.params
        const user = await User.findById(id).select("-password -__v")
        user.lists.push(req.body.list)
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send({message: "Failed Updating"})
    }
})

// change list
router.patch('/:id/:list', auth, async(req, res) => {
    try {
        const { error } = validateSingleList(req.body)
        if( error ) 
            return res.status(400).send({ message: error.details[0].message })
        const newName = req.body.list
        const { id, list} = req.params
        const user = await User.findById(id).select("-password -__v")
        user.lists = user.lists.map(item => item === list ? newName : item)
        const words = await Word.find({user: id})    
        for (const word of words) {
            if( word.lists.includes(list) ) {
                word.lists = word.lists.map(item => item === list ? newName : item)
                await word.save()
            }
        }
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        res.status(404).send({message: "Failed to change list name"})
    }
})

// delete List
router.put('/deleteList/:id/:list', auth, async(req, res) => {
    try {
        const { id, list} = req.params
        const user = await User.findById(id).select("-password -__v")
        user.lists = user.lists.filter(item => item !== list)
        const words = await Word.find({user: id})    
        for (const word of words) {
            if( word.lists.includes(list) ) {
                word.lists = word.lists.filter(item => item !== list)
                if( word.lists.length === 0 )
                    await word.delete()
                else
                    await word.save()
            }
        }
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        res.status(404).send({message: "Failed"})
    }
})


export default router;