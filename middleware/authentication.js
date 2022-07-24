import jwt from "jsonwebtoken";

// const auth = (req, res, next) => {
//     const token = req.header('x-auth-token')

//     if(!token)
//         return res.status(400).send({msg: "Access denied, no token provided." })

//     jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, validToken) => {
//         if(err)
//             return res.status(400).send({ msg: "Invalid Token" })

//         req.user = validToken;
//         next();
//     })
// }

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        
        if( !token )
            return res.status(400).send({message: "Access denied, no token provided." })
        
        decodedData = jwt.verify(token, process.env.JWT_PRIVATE_KEY)    
        req.userId = decodedData?.id;
        next();
    } catch (error) {
        console.log(error);
    }
};

export default auth;
