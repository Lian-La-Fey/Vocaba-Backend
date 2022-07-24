import express from 'express'
import { List, validate } from '../models/List.js';
import { Word } from '../models/Word.js'
import { User } from '../models/User.js';
import auth from '../middleware/authentication.js'
import validateObjectId from '../middleware/validateObjectId.js';
import Joi from 'joi';
import mongoose from 'mongoose';

const router = express.Router()

// get all user's lists
router.get('/userLists/:id', auth, async (req, res) => {
    const { id } = req.params
    
    if( !mongoose.Types.ObjectId.isValid(id) )
        return res.status(404).send({ message: "User doesn't exist" });
    
    const lists = await List.find({user: id})
    res.status(200).send({ data: lists })
})

// get list by id
router.get('/:id', [validateObjectId, auth], async (req, res) => {

    const list = await List.findById(rq.params.id)
    if ( !list )
        return res.status(404).send("Not Found!")
    
    const words = await Word.find({ _id: list.words })
    res.status(200).send({ data: {list, words}})
})

// create list
router.post('/', auth, async (req, res) => {
    
    const { error } = validate({...req.body, user: req.user._id})
    if( error )
        return res.status(400).send(error)
        
    const user = await User.findById(req.user._id)
    const list = await new List({ ...req.body, user: user._id}).save()
    user.lists.push(list._id)
    await user.save()
    
    res.status(201).send({ data: list })
})

// edit list
router.patch('/edit/:id', [validateObjectId, auth], async (req, res) => {
    
    const schema = Joi.object({
        name: Joi.string().required()
    })
    
    const { error } = schema.validate(req.body)
    if ( error )
        return res.status(400).send({ error })
        
    const list = await List.findById(req.params.id)
    if ( !list )
        return res.status(404).send({ message: 'Word List not found!'})
        
    const user = await User.findById(req.user._id)
    if ( !user._id.equals(list.user) )
        return res.status(403).send({ message: "User don't have access to edit!" })
        
    list.name = req.body.name
    await list.save()
    
    res.status(200).send({ message: 'List updated' })
})

// add word to list
router.put('/add-word', auth, async (req, res) => {
    
    const schema = Joi.object({
        listId: Joi.string().required(),
        wordId: Joi.string().required()
    })
    
    const { error } = schema.validate(req.body)
    if ( error )
        return res.status(400).send({ error })
    
    const user = await User.findById(req.user._id)
    const list = await List.findById(req.body.listId)
    
    if ( !user._id.equals(list.user) )
        return res.status(403).send({ message: "User don't have access to add!" });
    
    if ( list.words.indexOf(req.body.wordId) !== -1) 
        return res.status(403).send({ message: "Word doesn't exist..." })
    
    list.words.push(req.body.wordId)
    res.status(200).send({ data: list, message: "Word added to list" });
})
    
// remove word from list
router.put('/remove-word', auth, async (req, res) => {
    const schema = Joi.object({
		listId: Joi.string().required(),
		wordId: Joi.string().required(),
	});
    
	const { error } = schema.validate(req.body);
	if (error) 
        return res.status(400).send({ error });

	const user = await User.findById(req.user._id);
	const list = await List.findById(req.body.listId);
	if ( !user._id.equals(list.user) )
		return res.status(403).send({ message: "User don't have access!" });

    list.words = list.words.filter(id => id !== req.body.wordId)
	await list.save();
	res.status(200).send({ data: list, message: "Removed from list" });
})

router.delete('/:id', [validateObjectId, auth], async (req, res) => {
    const user = await User.findById(req.user._id)
    const list = await List.findById(req.params.id);
	if  (!user._id.equals(list.user) )
		return res.status(403).send({ message: "User don't have access!" });

	const index = user.lists.indexOf(req.params.id);
	user.lists.splice(index, 1);
	await user.save();
	await list.remove();
	res.status(200).send({ message: "Removed from lists" });
})

export default router