import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const store = async (data) => {
    return await prisma.usuario.create({
        data: {
            nome: data.nome,
            email: data.email,
            matricula: data.matricula,
            tipo: data.tipo || 'ALUNO',
            senha: data.senha,
            telefone: data.telefone || null,
            nascimento: data.nascimento ? new Date(data.nascimento) : null
        }
    });
}

export const getAll = async () => {
    return await prisma.usuario.findMany({
        select: {
            id: true,
            nome: true,
            email: true,
            matricula: true,
            tipo: true
        }
    });
}

export const getOne = async (id) => {
    return await prisma.usuario.findUnique({
        where: { id },
        select: {
            id: true,
            nome: true,
            email: true,
            matricula: true,
            tipo: true,
            telefone: true,
            nascimento: true
        }
    });
}

export const update = async (id, data) => {
    return await prisma.usuario.update({
        where: { id },
        data: {
            nome: data.nome,
            email: data.email,
            matricula: data.matricula,
            tipo: data.tipo,
            telefone: data.telefone,
            nascimento: data.nascimento ? new Date(data.nascimento) : null
        }
    });
}

export const deletar = async (id) => {
    return await prisma.usuario.delete({
        where: { id }
    });
}