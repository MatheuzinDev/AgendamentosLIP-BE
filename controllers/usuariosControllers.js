import * as usuariosRepository from '../repository/usuariosRepository.js';
import { Prisma } from '@prisma/client';

export const store = async (req, res) => {
    try {
        const requiredFields = ['nome', 'email', 'matricula', 'senha'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Campos obrigatórios faltando',
                missing: missingFields
            });
        }

        const usuario = await usuariosRepository.store(req.body);
        res.status(201).json(usuario)

    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const conflictField = error.meta?.target[0];
                return res.status(409).json({
                    error: 'Conflito de dados',
                    message: `Já existe um usuário com este ${conflictField}`
                });
            }
        }
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

export const getAll = async (req, res) => {
    try {
        const usuarios = await usuariosRepository.getAll();
        res.status(200).json(usuarios);
    } catch(error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
}

export const getOne = async (req, res) => {
    try {
        const usuario = await usuariosRepository.getOne(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.status(200).json(usuario);
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao recuperar usuário' });
    }
}

export const getOneByMatricula = async (req, res) => {
    try {
        const usuario = await usuariosRepository.getOneByMatricula(req.params.matricula);
        
        if (!usuario) {
            return res.status(404).json({ 
                error: 'Usuário não encontrado',
                message: 'Nenhum usuário encontrado com esta matrícula'
            });
        }
        
        res.status(200).json(usuario);
        
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ 
                error: 'Usuário não encontrado',
                message: 'Matrícula não cadastrada no sistema'
            });
        }
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao recuperar usuário' });
    }
}

export const update = async (req, res) => {
    try {
        const updated = await usuariosRepository.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            if (error.code === 'P2002') {
                const conflictField = error.meta?.target[0];
                return res.status(409).json({
                    error: 'Conflito de dados',
                    message: `Já existe um usuário com este ${conflictField}`
                });
            }
        }
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
}

export const deletar = async (req, res) => {
    try {
        await usuariosRepository.deletar(req.params.id);
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
}

export const updateByMatricula = async (req, res) => {
    try {
        const { matricula } = req.params;
        const updated = await usuariosRepository.updateByMatricula(matricula, req.body);
        
        if (!updated) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.status(200).json(updated);
        
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            if (error.code === 'P2002') {
                const conflictField = error.meta?.target[0];
                return res.status(409).json({
                    error: 'Conflito de dados',
                    message: `Já existe um usuário com este ${conflictField}`
                });
            }
        }
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
}

export const deletarByMatricula = async (req, res) => {
    try {
        const { matricula } = req.params;
        await usuariosRepository.deletarByMatricula(matricula);
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
        
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
}