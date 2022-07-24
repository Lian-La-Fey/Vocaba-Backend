import express from 'express'
import { Word, validate } from '../models/Word.js'
import auth from '../middleware/authentication.js'
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router()

// create word
router.post('/', auth, async (req, res) => {
    // const { error } = validate(req.body)
    // if ( error )
    //     res.status(400).send({ message: error.details[0].message })
    
    const word = await new Word(req.body).save()
    res.status(201).send({ data: word, message: "Word Created"})
})


// get all user's words
router.get('/userWords/:id', async (req, res) => {
    const { userId } = { ...req.params }
    const words = await Word.find({user: userId})
    res.status(200).send({ data: words })
})

// get word by id
router.get('/:id', async (req, res) => {
    const { id } = { ...req.params }
    const word = await Word.findById(id)
    res.status(200).send({ data: word })
})


// Update word
router.patch('/:id', [validateObjectId, auth], async (req, res) => {
    const word = await Word.findByIdAndUpdate(req.params.id, { $set: req.body}, {new: true})
    res.send({ data: word, message: "Word updated successfully" })
})

// delete word
router.delete('/:id', [validateObjectId, auth], async (req, res) => {
    await Word.findByIdAndDelete(req.params.id)
    res.status(200).send({ message: "Word deleted successfully" })
})

export default router

// https://stackoverflow.com/questions/47790025/mongoose-findbyidandupdate-finds-returns-object-but-does-not-update