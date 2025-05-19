import * as mesasRepository from '../repository/mesasRepository.js';
import { Prisma } from '@prisma/client';

export const store = async (req, res) => {
    try {
        // Validação do campo obrigatório
        if (!req.body.numero) {
            return res.status(400).json({
                error: 'Campo obrigatório faltando',
                message: 'O número da mesa é obrigatório'
            });
        }

        const novaMesa = await mesasRepository.store(req.body);
        res.status(201).json({
            message: 'Mesa criada com sucesso',
            data: novaMesa
        });

    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(409).json({
                    error: 'Conflito de dados',
                    message: 'Já existe uma mesa com este número'
                });
            }
        }
        console.error('Erro ao criar mesa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export const getAll = async (req, res) => {
    try {
        const mesas = await mesasRepository.getAllComStatusAtual();
        console.log('Horário na resposta:', new Date().toISOString());
        res.status(200).json(mesas);
    } catch(error) {
        console.error('Erro ao buscar mesas:', error);
        res.status(500).json({ error: 'Erro ao listar mesas' });
    }
}

export const getOne = async (req, res) => {
    try {
        const mesa = await mesasRepository.getOne(req.params.id);
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa não encontrada' });
        }
        res.status(200).json(mesa);
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Mesa não encontrada' });
        }
        console.error('Erro ao buscar mesa:', error);
        res.status(500).json({ error: 'Erro ao recuperar mesa' });
    }
}

export const update = async (req, res) => {
    try {
        // Validação do campo obrigatório
        if (req.body.numero === undefined) {
            return res.status(400).json({
                error: 'Campo obrigatório faltando',
                message: 'O número da mesa é obrigatório'
            });
        }

        const mesaAtualizada = await mesasRepository.update(req.params.id, req.body);
        if (!mesaAtualizada) {
            return res.status(404).json({ error: 'Mesa não encontrada' });
        }
        res.status(200).json({
            message: 'Mesa atualizada com sucesso',
            data: mesaAtualizada
        });
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Mesa não encontrada' });
            }
            if (error.code === 'P2002') {
                return res.status(409).json({
                    error: 'Conflito de dados',
                    message: 'Já existe uma mesa com este número'
                });
            }
        }
        console.error('Erro ao atualizar mesa:', error);
        res.status(500).json({ error: 'Erro ao atualizar mesa' });
    }
}

export const deletar = async (req, res) => {
    try {
        const mesaDeletada = await mesasRepository.deletar(req.params.id);
        if (!mesaDeletada) {
            return res.status(404).json({ error: 'Mesa não encontrada' });
        }
        res.status(200).json({
            message: 'Mesa deletada com sucesso',
            data: mesaDeletada
        });
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Mesa não encontrada' });
        }
        console.error('Erro ao deletar mesa:', error);
        res.status(500).json({ error: 'Erro ao deletar mesa' });
    }
}