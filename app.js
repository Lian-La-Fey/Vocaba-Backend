import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import morgan from 'morgan';
import users from './routes/users.js'
import auth from './routes/auth.js';
import words from './routes/words.js';

dotenv.config()

const app = express();
const port = process.env.PORT || 8000;

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
}

app.use(morgan("dev"))
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors(corsOptions))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, X-Auth-Token, X-JSON'
    )
    next();
  })

const mongo_uri = process.env.DB_CONNECTION

mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxIdleTimeMS: 80000,
    serverSelectionTimeoutMS: 80000,
    socketTimeoutMS: 0,
    connectTimeoutMS: 0
})
    .then(() => {
        console.log("Connected to Database")
    })
    .catch((err) => {
        console.log(err)
        process.exit()
    });

app.get('/', (req, res) => {
    res.send('Home')
})


app.use("/api/users", users)
app.use("/api/login", auth)
app.use("/api/words", words)

app.listen(port, () => {
    console.log(`Server is started on ${port}`)
})