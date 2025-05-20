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
        const user = req.user;
        const { status, mesaId, data } = req.query; // Adicionamos novos filtros

        const filters = {
            aluno_id: user.id,
            ...(status && { status }),
            ...(mesaId && { mesa_id: mesaId }), // Novo filtro de mesa
            ...(data && { data: new Date(data) }) // Novo filtro de data
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

    console.log('=== DEBUG - CHECKIN QR ===');
    console.log('Agora ISO recebido:', agoraISO);
    console.log('Agora UTC:', agoraUTC.toISOString());

    // Extrai a data (YYYY-MM-DD)
    const datePart = agoraUTC.toISOString().slice(0, 10);
    console.log('Date part (YYYY-MM-DD):', datePart);

    // Monta intervalos já com offset -03:00
    const intervalosAulaUTC = HORARIOS_AULA.map(({ inicio, fim }) => {
      const inicioUTC = new Date(`${datePart}T${inicio}:00-03:00`);
      const fimUTC    = new Date(`${datePart}T${fim}:00-03:00`);
      console.log(`Intervalo local ${inicio}–${fim} → UTC ${inicioUTC.toISOString()}–${fimUTC.toISOString()}`);
      return { inicioUTC, fimUTC };
    });

    // Verifica se está em horário de aula
    const duranteAula = intervalosAulaUTC.some(({ inicioUTC, fimUTC }) => {
      const dentro = agoraUTC >= inicioUTC && agoraUTC <= fimUTC;
      console.log(`Verificando se ${agoraUTC.toISOString()} está entre ${inicioUTC.toISOString()} e ${fimUTC.toISOString()}:`, dentro);
      return dentro;
    });

    console.log('Durante aula?', duranteAula);
    if (duranteAula) {
      return res.status(403).json({
        error: 'Check-in bloqueado',
        message: 'Horário de aula! Use o sistema de agendamento'
      });
    }

    // Calcula próximo horário de fim (próximo início de aula ou +30min)
    const proximosInicios = intervalosAulaUTC
      .map(i => i.inicioUTC)
      .filter(dt => dt > agoraUTC)
      .sort((a, b) => a - b);

    console.log('Próximos inícios UTC após agora:', proximosInicios.map(d => d.toISOString()));

    const proximoHorario = proximosInicios[0];
    console.log('Próximo início selecionado:', proximoHorario ? proximoHorario.toISOString() : 'nenhum');

    const horarioFimUTC = proximoHorario || new Date(agoraUTC.getTime() + 30 * 60000);
    console.log('Horario fim calculado:', horarioFimUTC.toISOString());

    // Verifica conflito no banco
    const conflito = await agendamentosRepository.verificarConflitoCheckin(
      mesaId,
      agoraUTC,
      horarioFimUTC
    );
    console.log('Conflito no banco?', !!conflito);

    if (conflito) {
      return res.status(409).json({
        error: 'Mesa ocupada',
        message: 'Já existe um check-in ativo nesta mesa'
      });
    }

    // Cria check-in
    const novoAgendamento = await agendamentosRepository.criarCheckinQR(
      user.id,
      mesaId,
      agoraUTC,
      horarioFimUTC
    );
    console.log('Novo agendamento criado:', novoAgendamento);

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
