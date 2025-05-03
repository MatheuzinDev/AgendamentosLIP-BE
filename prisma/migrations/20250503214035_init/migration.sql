/*
  Warnings:

  - You are about to drop the `horarios_indisponiveis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "horarios_indisponiveis" DROP CONSTRAINT "horarios_indisponiveis_mesa_id_fkey";

-- DropTable
DROP TABLE "horarios_indisponiveis";
