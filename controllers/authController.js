import * as usuariosRepository from '../repository/usuariosRepository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {
    try {
        const { matricula, senha } = req.body; 
        
        const usuario = await usuariosRepository.getOneByMatricula(matricula);

        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(401).json({ error: 'Matrícula ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: usuario.id, matricula: usuario.matricula, tipo: usuario.tipo },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            usuario: { 
                id: usuario.id, 
                nome: usuario.nome, 
                tipo: usuario.tipo 
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
};