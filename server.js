import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
dotenv.config()

app.use(bodyParser.json());
app.use(cors());
app.use(express.json())

app.listen(process.env.PORT, () => {
    console.log(`Server rodando na porta ${process.env.PORT}`)
})