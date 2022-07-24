import mongoose from 'mongoose';
import Joi from 'joi'

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    words: {
        type: Array,
        default: []
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

export const validate = (list) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        user: Joi.string().required(),
        words: Joi.array().items(Joi.string())
    })
    
    return schema.validate(list)
}

export const List = mongoose.model("List", listSchema)
