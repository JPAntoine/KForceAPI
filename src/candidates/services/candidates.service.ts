import { Container, SqlQuerySpec } from '@azure/cosmos';
import { InjectModel } from '@nestjs/azure-database';
import { Injectable } from '@nestjs/common';
import { resCandidateDto } from '../dtos/resCandidate.dto';
import { Candidate } from '../entities/candidate.entity';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate) private readonly candidateContainer: Container,
  ) {}

  async getByName(name: string): Promise<resCandidateDto> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE LOWER(c.Name) like LOWER(@value)',
      parameters: [
        {
          name: '@value',
          value: `%${name}%`,
        },
      ],
    };

    const cosmosResults = await this.candidateContainer?.items
      ?.query<Candidate>(querySpec)
      .fetchAll();

    const res = cosmosResults.resources.map<resCandidateDto>((value) => {
      return {
        name: value.Name,
        title: value.Title,
        city: value.City,
        jobs: value.jobs,
        virtualBench: value.VirtualBench,
        resumes: value.Resumes,
        id: value.id,
      };
    });

    return res[0];
  }
}
