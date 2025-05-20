/*
  Warnings:

  - The values [CANCELADO] on the enum `StatusAgendamento` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusAgendamento_new" AS ENUM ('PENDENTE', 'ACEITO', 'REJEITADO', 'RESERVADO');
ALTER TABLE "agendamentos" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "agendamentos" ALTER COLUMN "status" TYPE "StatusAgendamento_new" USING ("status"::text::"StatusAgendamento_new");
ALTER TYPE "StatusAgendamento" RENAME TO "StatusAgendamento_old";
ALTER TYPE "StatusAgendamento_new" RENAME TO "StatusAgendamento";
DROP TYPE "StatusAgendamento_old";
ALTER TABLE "agendamentos" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
COMMIT;

-- CreateIndex
CREATE INDEX "agendamentos_mesa_id_status_idx" ON "agendamentos"("mesa_id", "status");
