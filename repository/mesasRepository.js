import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const store = async (data) => {
    return await prisma.mesa.create({
        data: {
            numero: data.numero,
            descricao: data.descricao || null,
            status: data.status || 'DISPONIVEL',
            recursos: data.recursos || []
        },
        select: {
            id: true,
            numero: true,
            status: true
        }
    });
}

export const getAll = async () => {
    return await prisma.mesa.findMany({
        select: {
            id: true,
            numero: true,
            status: true,
            descricao: true,
            recursos: true
        }
    });
}

export const getOne = async (id) => {
    return await prisma.mesa.findUnique({
        where: { id },
        select: {
            id: true,
            numero: true,
            status: true,
            descricao: true,
            recursos: true,
            criado_em: true,
            atualizado_em: true
        }
    });
}

export const update = async (id, data) => {
    return await prisma.mesa.update({
        where: { id },
        data: {
            numero: data.numero,
            descricao: data.descricao,
            status: data.status,
            recursos: data.recursos
        },
        select: {
            id: true,
            numero: true,
            status: true
        }
    });
}

export const deletar = async (id) => {
    return await prisma.mesa.delete({
        where: { id },
        select: {
            id: true,
            numero: true
        }
    });
}