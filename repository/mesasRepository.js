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

    // Busca agendamentos ACEITOS e RESERVADOS ativos
    const [agendamentosAtivos, reservasAtivas] = await Promise.all([
        prisma.agendamento.findMany({
            where: {
                status: 'ACEITO',
                horario_inicio: { lte: agoraUTC },
                horario_fim: { gte: agoraUTC }
            },
            select: { mesa_id: true }
        }),
        prisma.agendamento.findMany({
            where: {
                status: 'RESERVADO',
                horario_inicio: { lte: agoraUTC },
                horario_fim: { gte: agoraUTC }
            },
            select: { mesa_id: true }
        })
    ]);

    // Conjuntos de IDs de mesas ocupadas/reservadas
    const mesasOcupadasIds = new Set(agendamentosAtivos.map(ag => ag.mesa_id));
    const mesasReservadasIds = new Set(reservasAtivas.map(ag => ag.mesa_id));

    // Busca todas as mesas
    const mesas = await prisma.mesa.findMany({
        select: { id: true, numero: true, status: true },
        orderBy: { numero: 'asc' }
    });

    // Atualiza status dinamicamente
    return mesas.map(mesa => {
        if (mesasOcupadasIds.has(mesa.id)) {
            return { ...mesa, status: 'OCUPADA' }; // Prioridade para ocupadas
        }
        if (mesasReservadasIds.has(mesa.id)) {
            return { ...mesa, status: 'RESERVADA' };
        }
        return mesa; // Mantém status original se não houver agendamentos
    });
};