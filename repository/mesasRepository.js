import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const store = async (data) => {
    return await prisma.mesa.create({
        data: {
            numero: data.numero,
            descricao: data.descricao || null,
            status: data.status || 'DISPONIVEL',
            recursos: data.recursos || []
        }
    })
}

export const getAll = async () => {
    return await prisma.mesa.findMany()
}

export const getOne = async (id) => {
    return await prisma.mesa.findUnique({
        where: { id: id }
    })
}

export const update = async (id, body) => {
    return await prisma.mesa.update({
        where: { id: id },
        data: body
    })
}

export const deletar = async (id) => {
    return await prisma.mesa.delete({
        where: { id: id }
    })
}