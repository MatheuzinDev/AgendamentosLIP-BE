import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'
import mesasRoutes from './routes/mesasRoutes.js'
import usuariosRoutes from './routes/usuariosRoutes.js'
import agendamentosRoutes from './routes/agendamentosRoutes.js'

const app = express()
dotenv.config()

app.use(bodyParser.json());
app.use(cors());
app.use(express.json())

app.listen(process.env.PORT, () => {
    console.log(`Server rodando na porta ${process.env.PORT}`)
})

app.use('/mesas', mesasRoutes)
app.use('/usuarios', usuariosRoutes)
app.use('/agendamentos', agendamentosRoutes)