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
        },
        orderBy: {
            numero: 'asc'
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

export const getAllComStatusAtual = async () => {
    const agora = new Date();
    const offset = agora.getTimezoneOffset() * 60000;
    const agoraUTC = new Date(agora.getTime() - offset).toISOString();

    const agendamentosAtivos = await prisma.agendamento.findMany({
        where: {
            status: 'ACEITO',
            horario_inicio: {
                lte: new Date(agoraUTC).toISOString()
            },
            horario_fim: {
                gte: new Date(agoraUTC).toISOString()
            }
        },
        select: {
            mesa_id: true,
            horario_inicio: true,
            horario_fim: true
        }
    });

    console.log('=== DEBUG HORÁRIOS ===');
    console.log('Hora Local:', new Date().toLocaleString('pt-BR'));
    console.log('Hora UTC:', agoraUTC);

    agendamentosAtivos.forEach(ag => {
        const inicioUTC = new Date(ag.horario_inicio).toISOString();
        const fimUTC = new Date(ag.horario_fim).toISOString();
        console.log(`Mesa ${ag.mesa_id} | UTC: ${inicioUTC} - ${fimUTC}`);
    });

    const mesasOcupadasIds = new Set(agendamentosAtivos.map(ag => ag.mesa_id));

    const mesas = await prisma.mesa.findMany({
        select: { id: true, numero: true, status: true },
        orderBy: { numero: 'asc' }
    });

    return mesas.map(mesa => ({
        ...mesa,
        status: mesasOcupadasIds.has(mesa.id) ? 'OCUPADA' : mesa.status
    }));
};