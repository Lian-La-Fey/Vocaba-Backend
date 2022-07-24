import mongoose from 'mongoose';
import Joi from 'joi';

const wordSchema = new mongoose.Schema({
    word: {type: String, required: true},
    phonetic: String,
    pronunciation: {uk: String, us: String, _id: false},
    meanings: {
        type: [{
            partOfSpeech: {type: String, required: true},
            definitions: {
                type: [{
                    definition: {type: String, required: true},
                    examples: {type: [String], default: []},
                    _id: false
                }], required: true
            },
            synonyms: {type: [String], default: []},
            antonyms: {type: [String], default: []},
        }], required: true,
        _id: false
    },
    list: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
    
})

export const validate = (word) => {
    const schema = Joi.object({
        word: Joi.string().required(),
        phonetic: Joi.string().allow(""),
        pronunciation: Joi.object({
            uk: Joi.string().allow(""),
            us: Joi.string().allow("")
        }),
        meanings: Joi.array().items(Joi.object({
            partOfSpeech: Joi.string().required(),
            definitions: Joi.array().items(Joi.object({
                definition: Joi.string().required(),
                examples: Joi.array().items(Joi.string()).allow([]),
            })).required(),
            synonyms: Joi.array().items(Joi.string()).allow([]),
            antonyms: Joi.array().items(Joi.string()).allow([])
        })).required(),
        list: Joi.string().required(),
        user: Joi.string().required(),
    })
    
    return schema.validate(word)
}

export const Word = mongoose.model("Word", wordSchema)
