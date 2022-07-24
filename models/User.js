import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    lists: {
        type: [String],
        default: []
    }
    
})

export const validate = (user) => {
    const schema = Joi.object({
        userName: Joi.string().min(3).max(10).required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
    
    return schema.validate(user)
}



export const User = mongoose.model("User", userSchema)
