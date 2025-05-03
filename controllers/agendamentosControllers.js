import * as agendamentosRepository from '../repository/agendamentosRepository.js';

export const store = async (req, res) => {
    try {
        const agendamento = await agendamentosRepository.store(req.body);
        res.status(200).send('Agendamento cadastrado com sucesso!');
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}

export const getAll = async (req, res) => {
    try {
        const agendamentos = await agendamentosRepository.getAll();
        res.status(200).send(agendamentos);
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}

export const getOne = async (req, res) => {
    try {
        const agendamento = await agendamentosRepository.getOne(req.params.id);
        res.status(200).send(agendamento);
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}

export const update = async (req, res) => {
    try {
        await agendamentosRepository.update(req.params.id, req.body);
        res.status(200).send('Agendamento atualizado com sucesso!');
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}

export const deletar = async (req, res) => {
    try {
        await agendamentosRepository.deletar(req.params.id);
        res.status(200).send('Agendamento deletado com sucesso!');
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}