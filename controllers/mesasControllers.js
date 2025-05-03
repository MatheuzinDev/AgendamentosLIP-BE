import * as mesasRepository from '../repository/mesasRepository.js'

export const store = async (req, res) => {
    try {
        let body = req.body
        await mesasRepository.store(body)
        res.status(200).send(`Mesa cadastrada com sucesso!`)
    } catch(error) {
        res.status(500).send(`O erro foi ${error}`)
    }
}

export const getAll = async (req, res) => {
    try {
        const mesas = await mesasRepository.getAll();
        res.status(200).send(mesas);
    } catch (error) {
        res.status(500).send(`O error foi ${error}`)
    }
}

export const getOne = async (req, res) => {
    try {
        let { id } = req.params;
        const mesa = await mesasRepository.getOne(id)
        res.status(200).send(mesa)
    } catch(error){
        res.status(500).send(`O erro foi ${error}`)
    }
}

export const update = async (req, res) => {
    try {
        let { id } = req.params
        let body = req.body
        await mesasRepository.update(id, body)
        res.status(200).send(`Mesa atualizada com sucesso!`)
    } catch(error) {
        res.status(500).send(`O erro foi ${error}`)
    }
}

export const deletar = async (req, res) => {
    try {
        let { id } = req.params;
        await mesasRepository.deletar(id)
        res.status(200).send(`Mesa deletada com sucesso!`)
    } catch(error) {
        res.status(500).send(`O erro foi ${error}`)
    }
}