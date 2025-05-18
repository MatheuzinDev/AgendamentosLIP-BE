import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const store = async (data) => {
    const [aluno, mesa] = await Promise.all([
        prisma.usuario.findUnique({ where: { id: data.aluno_id } }),
        prisma.mesa.findUnique({ where: { id: data.mesa_id } })
    ]);

    if (!aluno || !mesa) {
        throw new Error('Aluno ou Mesa não encontrado');
    }

    return await prisma.agendamento.create({
        data: {
            aluno_id: data.aluno_id,
            mesa_id: data.mesa_id,
            data: new Date(data.data),
            horario_inicio: new Date(data.horario_inicio),
            horario_fim: new Date(data.horario_fim),
            status: data.status || 'PENDENTE',
            motivo_rejeicao: data.motivo_rejeicao || null,
            supervisor_id: data.supervisor_id || null
        },
        include: {
            aluno: { select: { nome: true, matricula: true } },
            mesa: { select: { numero: true } }
        }
    });
}

export const getAll = async (filters = {}) => {
    return await prisma.agendamento.findMany({
        where: filters,
        select: {
            id: true,
            data: true,
            horario_inicio: true,
            horario_fim: true,
            status: true,
            aluno: { select: { nome: true, matricula: true } },
            mesa: { select: { numero: true } }
        },
        orderBy: { data: 'asc' }
    });
}

export const getOne = async (id) => {
    return await prisma.agendamento.findUnique({
        where: { id },
        select: {
            id: true,
            data: true,
            horario_inicio: true,
            horario_fim: true,
            status: true,
            motivo_rejeicao: true,
            aluno: { select: { nome: true, matricula: true } },
            mesa: { select: { numero: true } },
            supervisor: { select: { nome: true } },
            criado_em: true,
            atualizado_em: true
        }
    });
}

export const update = async (id, data) => {
    return await prisma.agendamento.update({
        where: { id },
        data: {
            status: data.status,
            motivo_rejeicao: data.motivo_rejeicao,
            supervisor_id: data.supervisor_id
        },
        select: {
            id: true,
            status: true,
            motivo_rejeicao: true,
            supervisor: { select: { nome: true } }
        }
    });
}

export const deletar = async (id) => {
    return await prisma.agendamento.delete({
        where: { id },
        select: { id: true, data: true, mesa: { select: { numero: true } } }
    });
}

export const getAllPendentes = async () => {
    return await prisma.agendamento.findMany({
        where: { status: 'PENDENTE' },
        select: {
            id: true,
            data: true,
            horario_inicio: true,
            horario_fim: true,
            status: true,
            aluno: { select: { nome: true, matricula: true } },
            mesa: { select: { numero: true } },
            criado_em: true
        },
        orderBy: { criado_em: 'asc' }
    });
}

export const getMeusAgendamentos = async (filters = {}) => {
    return await prisma.agendamento.findMany({
        where: filters,
        select: {
            id: true,
            data: true,
            horario_inicio: true,
            horario_fim: true,
            status: true,
            motivo_rejeicao: true,
            aluno: { select: { nome: true, matricula: true } },
            mesa: { select: { numero: true } },
            supervisor: { select: { nome: true } },
            criado_em: true
        },
        orderBy: { criado_em: 'desc' }
    });
}