import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const store = async (data) => {
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
        }
    });
}

export const getAll = async () => {
    return await prisma.agendamento.findMany({
        include: {
            aluno: { select: { nome: true, matricula: true } },
            mesa: { select: { numero: true } }
        }
    });
}

export const getOne = async (id) => {
    return await prisma.agendamento.findUnique({
        where: { id },
        include: {
            aluno: { select: { nome: true, matricula: true } },
            mesa: { select: { numero: true } },
            supervisor: { select: { nome: true } }
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
        }
    });
}

export const deletar = async (id) => {
    return await prisma.agendamento.delete({
        where: { id }
    });
}