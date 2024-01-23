import { CosmosPartitionKey } from '@nestjs/azure-database';
import { UUID } from 'crypto';

@CosmosPartitionKey('Name')
export class Candidate {
  Name: string;
  Title: string;
  City: string;
  jobs: Array<IJobExperience>;
  VirtualBench: number;
  Resumes: string;
  id: UUID;
}

export interface IJobExperience {
  title: string;
  start: Date;
  end: Date;
}
