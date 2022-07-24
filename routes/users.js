import {User, validate} from '../models/User.js'
import bcrypt from 'bcrypt'
import express from 'express';
import validateObjectId from '../middleware/validateObjectId.js'
import auth from '../middleware/authentication.js';


const router = express.Router()

// create user
router.post('/', async (req, res) => {
    
    const { error } = validate(req.body)
    if( error )
        return res.status(400).json({ message: 'At least one field is failed.' })
    
    const { userName, email, password } = req.body;
    
    const user = await User.findOne({$or:[{userName: userName}, {email: email}]})
    if ( user )
        return res.status(400).json({ message: 'User already exists with this user name or email' })
        
    const newUser = new User({userName, email, password})
    bcrypt.hash(password, 10, async (err, hash) => {
        newUser.password = hash
        await newUser.save()
        res.status(200).send({message: "Registration successfull"})
    })
})


// router.get('/:id', [validateObjectId, auth], async (req, res) => {
//     const user = await User.findById(req.params.id).select('-password -__v')
//     res.status(200).send({ data: user })
// })

// router.patch('/:id', [validateObjectId, auth], async (req, res) => {
//     const user = await User.findByIdAndUpdate(req.params.id, 
//         { $set: req.body}).select('-password -__v')
//     res.status(200).send({ data: user, message: 'Profile Updated Successfully' })
// })

router.delete('/:id', [validateObjectId, auth], async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Successfull Deletion' })
})

export default router;