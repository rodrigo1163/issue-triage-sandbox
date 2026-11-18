import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  await prisma.projectCatalog.upsert({
    where: { repository: 'equipe/projeto-teste' },
    update: {
      responsibles: ['time-backend'],
      triageInstructions: [
        'Para bugs, coletar passos de reprodução, logs e ambiente.',
        'Para melhorias, registrar o problema do usuário e o resultado esperado.',
      ],
      active: true,
    },
    create: {
      repository: 'equipe/projeto-teste',
      responsibles: ['time-backend'],
      triageInstructions: [
        'Para bugs, coletar passos de reprodução, logs e ambiente.',
        'Para melhorias, registrar o problema do usuário e o resultado esperado.',
      ],
    },
  });
} finally {
  await prisma.$disconnect();
}
