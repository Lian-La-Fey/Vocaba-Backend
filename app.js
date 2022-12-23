import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import morgan from 'morgan';
import users from './routes/users.js'
import auth from './routes/auth.js';
import words from './routes/words.js';
import vercelCors from './middleware/vercelCors.js';

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
app.use(vercelCors)
app.use('/users', users)

const mongo_uri = process.env.DB_CONNECTION

mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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