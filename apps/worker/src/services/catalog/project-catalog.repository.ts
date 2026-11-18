import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ProjectCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByRepository(repository: string) {
    return this.prisma.projectCatalog.findFirst({
      where: {
        repository,
        active: true,
      },
      select: {
        repository: true,
        responsibles: true,
        triageInstructions: true,
      },
    });
  }
}
