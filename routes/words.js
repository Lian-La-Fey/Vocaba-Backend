import express from 'express'
import { Word, validate } from '../models/Word.js'
import auth from '../middleware/authentication.js'
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router()

// get word by id
router.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const word = await Word.findById(id)
        res.status(200).send({ data: word })
    } catch (error) {
        res.status(400).send({ message: "Database Error" })
    }  
})

// create word
router.post('/:userId', auth, async (req, res) => {
    try {
        const newWord = {...req.body, user: req.params.userId }
        newWord.createdAt = new Date()
        const date = new Date()
        date.setDate(date.getDate() + 1)
        newWord.nextProgress = date
        const { error } = validate(newWord)
        if ( error )
            return res.status(400).send({ message: error.details[0].message })
        const word = new Word(newWord)
        await word.save()
        res.status(201).send(word)
    } catch (error) {
        console.log(error);
        res.status(404).send({ message: "Database Error" })
    }
    
})

// Update word
router.patch('/:id', [validateObjectId, auth], async (req, res) => {
    try {
        const { error } = validate(req.body)
        if ( error )
            return res.status(400).send({ message: error.details[0].message })
        const word = await Word.findByIdAndUpdate(req.params.id, { $set: req.body}, {new: true})
        res.send(word)
    } catch (error) {
        res.status(400).send({message: "Database Error"})
    }
})

// delete word
router.delete('/:id', [validateObjectId, auth], async (req, res) => {
    await Word.findByIdAndDelete(req.params.id)
    res.status(200).send({ message: "Word deleted successfully" })
})

// get all user words
router.get('/userWords/:userId', auth, async (req, res) => {
    try {
        const words = await Word.find({user: req.params.userId}).select("-__v")
        res.status(200).send(words)
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Database Error" })
    }
})

export default router