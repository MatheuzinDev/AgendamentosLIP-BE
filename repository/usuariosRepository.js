import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from 'bcrypt'

export const store = async (data) => {
    const hashedPassword = await bcrypt.hash(data.senha, 10);

    return await prisma.usuario.create({
        data: {
            nome: 'admin',
            email: 'admin@email.com',
            matricula: '1111111',
            tipo: 'SUPERVISOR',
            senha: hashedPassword,
            telefone: data.telefone || null,
            nascimento: data.nascimento ? new Date(data.nascimento) : null
        }
    });

    return await prisma.usuario.create({
        data: {
            nome: data.nome,
            email: data.email,
            matricula: data.matricula,
            tipo: data.tipo || 'ALUNO',
            senha: hashedPassword,
            telefone: data.telefone || null,
            nascimento: data.nascimento ? new Date(data.nascimento) : null
        }
    });
}

export const getAll = async () => {
    return await prisma.usuario.findMany();
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
            nascimento: true,
            criado_em: true,
            atualizado_em: true
        }
    });
}

export const getOneByMatricula = async (matricula) => {
    return await prisma.usuario.findUnique({
        where: { matricula }
    })
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
        },
        select: {
            id: true,
            nome: true,
            email: true,
            matricula: true
        }
    });
}

export const deletar = async (id) => {
    return await prisma.usuario.delete({
        where: { id }
    });
}


export const updateByMatricula = async (matricula, data) => {
    if (data.senha) {
        data.senha = await bcrypt.hash(data.senha, 10);
    }

    return await prisma.usuario.update({
        where: { matricula },
        data: {
            nome: data.nome,
            email: data.email,
            matricula: data.matricula,
            tipo: data.tipo,
            telefone: data.telefone,
            nascimento: data.nascimento ? new Date(data.nascimento) : null,
            senha: data.senha
        }
    });
}

export const deletarByMatricula = async (matricula) => {
    return await prisma.usuario.delete({
        where: { matricula } // Delete por matrícula
    });
}

export const getPerfil = async (id) => {
    return await prisma.usuario.findUnique({
        where: { id },
        select: {
            id: true,
            nome: true,
            email: true,
            matricula: true,
            tipo: true,
            telefone: true,
            nascimento: true,
            criado_em: true
        }
    });
};

export const alterarSenha = async (id, senhaAtual, novaSenha) => {
    const usuario = await prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
        throw new Error('Senha atual incorreta');
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    return await prisma.usuario.update({
        where: { id },
        data: { senha: novaSenhaHash },
        select: { id: true, email: true, matricula: true }
    });
};