import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { ProjectCatalogRepository } from './project-catalog.repository.js';
import { ProjectCatalogService } from './project-catalog.service.js';

@Module({
  imports: [PrismaModule],
  providers: [ProjectCatalogRepository, ProjectCatalogService],
  exports: [ProjectCatalogService],
})
export class ProjectCatalogModule {}
