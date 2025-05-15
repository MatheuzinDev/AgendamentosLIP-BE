import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const store = async (data) => {
    return await prisma.mesa.create({
        data: {
            numero: data.numero,
            status: data.status || 'DISPONIVEL'
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
            status: data.status,
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