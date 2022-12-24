import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if( !token )
            return res.status(400).send({message: "Access denied, no token provided." })
            
        let decodedData;
        decodedData = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
        req.userId = decodedData?.id;
        console.log(req.userId)
        next();
    } catch (error) {
        res.status(404).send({ message: "Invalid Token" })
        console.log(error)
    }
};

export default auth;
