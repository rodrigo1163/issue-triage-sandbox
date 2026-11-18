import { Injectable } from '@nestjs/common';
import { ProjectCatalogRepository } from './project-catalog.repository.js';

export type ProjectContext = {
  repository: string;
  responsibles: string[];
  triageInstructions: string[];
};

@Injectable()
export class ProjectCatalogService {
  constructor(
    private readonly projectCatalogRepository: ProjectCatalogRepository,
  ) {}

  findByRepository(repository: string): Promise<ProjectContext | null> {
    return this.projectCatalogRepository.findByRepository(repository);
  }
}
