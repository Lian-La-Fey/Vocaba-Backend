import mongoose from 'mongoose';
import Joi from 'joi';

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true },
    phonetic: String,
    pronunciation: String,
    partOfSpeech: { type: String, required: true },
    definitions: {
        type: [{
            definition: { type: String, required: true },
            synonyms: { type: [String], default: [] },
            antonyms: { type: [String], default: [] },
            examples: String,
        }],
        _id : false,
        required: true
    },
    clips: { 
        type: [{
            uploadName: String,
            storageName: String,
            url: String
        }],
        _id : false,
        default: [] 
    },
    lists: { type: [String], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    progress: { type: Number, default: 0 },
    createdAt: { type: Date, default: new Date() },
    nextProgress: { type: Date, default: new Date() }
})

export const validate = (word) => {
    const schema = Joi.object({
        word: Joi.string().required().messages({
            "string.empty": "You must provide word name!",
            "string.required": "You must provide word name!"
        }),
        phonetic: Joi.string().allow(""),
        pronunciation: Joi.string().allow(""),
        partOfSpeech: Joi.string().required().messages({
            "string.required": "Part of speech is required.",
            "string.empty": "Part of speech is required."
        }),
        definitions: Joi.array().items(Joi.object({
            definition: Joi.string().required().messages({
                "string.required": "Definition is required.",
                "string.empty": "Definition is required."
            }).required(),
            synonyms: Joi.array().items(Joi.string()).required(),
            antonyms: Joi.array().items(Joi.string()).required(),
            examples: Joi.string().allow(""),
        })).required(),
        clips: Joi.array().items(Joi.object({
            uploadName: Joi.string().required(),
            storageName: Joi.string().required(),
            url: Joi.string().required(),
        })),
        lists: Joi.array().items(Joi.string().required().messages({
            "any.required": "You must provide some lists!"
        })).required().messages({
            "any.required": "You must provide some lists!",
            "array.includesRequiredUnknowns": "You must provide some lists!"
        }),
        user: Joi.string().required().messages({
            "any.required": "App error user not found!"
        }),
        createdAt: Joi.date(),
        progress: Joi.number(),
        nextProgress: Joi.date()
    })
    
    return schema.validate(word)
}

export const Word = mongoose.model("Word", wordSchema)
