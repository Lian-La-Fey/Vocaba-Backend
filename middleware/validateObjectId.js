import mongoose from 'mongoose';

const validateId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send({ msg: "Invalid ID."})
        
    next()
}

export default validateId