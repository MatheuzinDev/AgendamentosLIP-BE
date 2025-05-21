import * as agendamentosRepository from '../repository/agendamentosRepository.js';
import { Prisma } from '@prisma/client';
import { verificarConflitoCheckin, criarCheckinQR } from '../repository/agendamentosRepository.js';
import { HORARIOS_AULA } from '../constants/constants.js';

export const store = async (req, res) => {
    try {
        const requiredFields = ['aluno_id', 'mesa_id', 'data', 'horario_inicio', 'horario_fim'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Campos obrigatórios faltando',
                missing: missingFields
            });
        }

        const horarioInicio = new Date(req.body.horario_inicio).toISOString();
        const horarioFim = new Date(req.body.horario_fim).toISOString();

        if (horarioInicio >= horarioFim) {
            return res.status(400).json({
                error: 'Horário inválido',
                message: 'O horário de início deve ser anterior ao horário de término'
            });
        }

        const novoAgendamento = await agendamentosRepository.store(req.body);

        res.status(201).json({
            message: 'Agendamento criado com sucesso',
            data: novoAgendamento
        });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return res.status(404).json({
                    error: 'Recurso não encontrado',
                    message: 'Aluno ou Mesa não existe'
                });
            }
        }
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export const getAll = async (req, res) => {
    try {
        const { mesaId, data, status } = req.query;
        const filters = {
            ...(mesaId && { mesa_id: mesaId }),
            ...(data && { data: new Date(data) }),
            ...(status && { status })
        };

        const agendamentos = await agendamentosRepository.getAll(filters);
        res.status(200).json(agendamentos);
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
}

export const getOne = async (req, res) => {
    try {
        const agendamento = await agendamentosRepository.getOne(req.params.id);
        if (!agendamento) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        res.status(200).json(agendamento);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        console.error('Erro ao buscar agendamento:', error);
        res.status(500).json({ error: 'Erro ao recuperar agendamento' });
    }
}

export const update = async (req, res) => {
    try {
        if (req.body.status === 'REJEITADO' && !req.body.motivo_rejeicao) {
            return res.status(400).json({
                error: 'Motivo obrigatório',
                message: 'É necessário informar o motivo da rejeição'
            });
        }

        const agendamentoAtualizado = await agendamentosRepository.update(req.params.id, req.body);

        if (!agendamentoAtualizado) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        res.status(200).json({
            message: 'Agendamento atualizado com sucesso',
            data: agendamentoAtualizado
        });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Agendamento não encontrado' });
            }
            if (error.code === 'P2002') {
                return res.status(409).json({
                    error: 'Conflito de horário',
                    message: 'Já existe um agendamento para esta mesa no mesmo horário'
                });
            }
        }
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
}

export const deletar = async (req, res) => {
    try {
        const agendamentoDeletado = await agendamentosRepository.deletar(req.params.id);

        if (!agendamentoDeletado) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        res.status(200).json({
            message: 'Agendamento deletado com sucesso',
            data: agendamentoDeletado
        });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        console.error('Erro ao deletar agendamento:', error);
        res.status(500).json({ error: 'Erro ao deletar agendamento' });
    }
}

export const getAllPendentes = async (req, res) => {
    try {
        const agendamentos = await agendamentosRepository.getAllPendentes();
        res.status(200).json(agendamentos);
    } catch (error) {
        console.error('Erro ao buscar agendamentos pendentes:', error);
        res.status(500).json({ error: 'Erro ao buscar pedidos pendentes' });
    }
}

export const getMeusAgendamentos = async (req, res) => {
    try {
        const user = req.user; // Já vem do middleware de autenticação
        const { status, mesaId, data } = req.query;

        // Lógica modificada para supervisores
        const filters = {
            ...(user.tipo !== 'SUPERVISOR' && { aluno_id: user.id }), // Filtra por aluno somente se NÃO for supervisor
            ...(status && { status }),
            ...(mesaId && { mesa_id: mesaId }),
            ...(data && { data: new Date(data) })
        };

        const agendamentos = await agendamentosRepository.getMeusAgendamentos(filters);
        res.status(200).json(agendamentos);
        
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
}

export const checkinQR = async (req, res) => {
  try {
    const user = req.user;
    const { mesaId, agora: agoraISO } = req.body;
    const agoraUTC = new Date(agoraISO);

    // [Alteração] Converter UTC para horário local (-03:00)
    const offsetLocal = -3 * 60 * 60 * 1000; // Offset em milissegundos para -03:00
    const agoraLocal = new Date(agoraUTC.getTime() + offsetLocal); 

    // [Alteração] Extrair data no fuso local
    const datePartLocal = agoraLocal.toISOString().slice(0, 10); 

    // [Alteração] Montar intervalos no horário LOCAL (sem UTC)
    const intervalosAulaLocal = HORARIOS_AULA.map(({ inicio, fim }) => {
      const inicioLocal = new Date(`${datePartLocal}T${inicio}:00`);
      const fimLocal = new Date(`${datePartLocal}T${fim}:00`);
      console.log(`Intervalo LOCAL: ${inicioLocal.toISOString()}–${fimLocal.toISOString()}`);
      return { inicioLocal, fimLocal };
    });

    // [Alteração] Verificar se está em horário de aula (usando horário LOCAL)
    const duranteAula = intervalosAulaLocal.some(({ inicioLocal, fimLocal }) => {
      const dentro = agoraLocal >= inicioLocal && agoraLocal <= fimLocal;
      console.log(`Verificando LOCAL: ${agoraLocal.toISOString()} entre ${inicioLocal.toISOString()}–${fimLocal.toISOString()}:`, dentro);
      return dentro;
    });

    console.log('Durante aula?', duranteAula);
    if (duranteAula) {
      return res.status(403).json({
        error: 'Check-in bloqueado',
        message: 'Horário de aula! Use o sistema de agendamento'
      });
    }

    // [Alteração] Calcular horário fim em UTC (mantendo a lógica original)
    const proximosIniciosUTC = intervalosAulaLocal.map(({ inicioLocal }) => {
      return new Date(inicioLocal.getTime() - offsetLocal); // Convertendo local → UTC
    }).filter(dtUTC => dtUTC > agoraUTC);

    const proximoHorarioUTC = proximosIniciosUTC[0];
    const horarioFimUTC = proximoHorarioUTC || new Date(agoraUTC.getTime() + 30 * 60000);

    // Restante do código permanece igual...
    const conflito = await agendamentosRepository.verificarConflitoCheckin(
      mesaId,
      agoraUTC,
      horarioFimUTC
    );

    if (conflito) {
      return res.status(409).json({
        error: 'Mesa ocupada',
        message: 'Já existe um check-in ativo nesta mesa'
      });
    }

    const novoAgendamento = await agendamentosRepository.criarCheckinQR(
      user.id,
      mesaId,
      agoraUTC,
      horarioFimUTC
    );

    return res.status(201).json({
      ...novoAgendamento,
      horario_fim: horarioFimUTC.toISOString()
    });

  } catch (error) {
    console.error('Erro no check-in QR:', error);
    return res.status(500).json({
      error: 'Erro no check-in',
      message: 'Não foi possível completar a operação'
    });
  }
};