import * as usuariosRepository from '../repository/usuariosRepository.js';

export const store = async (req, res) => {
    try {
        const usuario = await usuariosRepository.store(req.body);
        res.status(200).send('Usuário cadastrado com sucesso!');
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}

export const getAll = async (req, res) => {
    try {
        const usuarios = await usuariosRepository.getAll();
        res.status(200).send(usuarios);
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}

export const getOne = async (req, res) => {
    try {
        const usuario = await usuariosRepository.getOne(req.params.id);
        res.status(200).send(usuario);
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}

export const update = async (req, res) => {
    try {
        await usuariosRepository.update(req.params.id, req.body);
        res.status(200).send('Usuário atualizado com sucesso!');
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}

export const deletar = async (req, res) => {
    try {
        await usuariosRepository.deletar(req.params.id);
        res.status(200).send('Usuário deletado com sucesso!');
    } catch(error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
}