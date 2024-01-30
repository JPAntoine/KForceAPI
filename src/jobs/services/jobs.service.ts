import { Container, SqlQuerySpec } from '@azure/cosmos';
import { InjectModel } from '@nestjs/azure-database';
import { Injectable } from '@nestjs/common';
import { IJobDto } from 'src/jobs/dtos/resJob.dto';
import { Job } from 'src/jobs/entities/jobs.entity';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job) private readonly jobContainer: Container) {}

  async getAllJobs(): Promise<Array<IJobDto>> {
    const sqlQuery: string = 'select * from c';

    const cosmosResults = await this.jobContainer?.items
      ?.query<Job>(sqlQuery)
      .fetchAll();
    const res = cosmosResults.resources.map<IJobDto>((value) => {
      return {
        id: value.id,
        jobTitle: value.Title,
        jobFlexibility: value.Flexibility,
        jobDescription: value.Description,
        jobSalary: value.Salary,
        skills: value.Skills,
        company: value.Company,
        location: value.Location,
      };
    });
    return res;
  }

  async getJobsByMatch(search: string): Promise<Array<IJobDto>> {
    const querySpec: SqlQuerySpec = {
      query:
        'SELECT * FROM c WHERE CONTAINS(LOWER(c.Title), LOWER(@value)) OR CONTAINS(LOWER(c.Description), LOWER(@value))',
      parameters: [
        {
          name: '@value',
          value: `${search}`,
        },
      ],
    };

    const cosmosResults = await this.jobContainer?.items
      ?.query<Job>(querySpec)
      .fetchAll();
    const res = cosmosResults.resources.map<IJobDto>((value) => {
      return {
        id: value.id,
        jobTitle: value.Title,
        jobFlexibility: value.Flexibility,
        jobDescription: value.Description,
        jobSalary: value.Salary,
        skills: value.Skills,
        company: value.Company,
        location: value.Location,
      };
    });
    return res;
  }
}
