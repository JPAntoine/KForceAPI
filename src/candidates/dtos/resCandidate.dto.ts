import { UUID } from 'crypto';
import { IJobExperience } from '../entities/candidate.entity';

export class resCandidateDto {
  name: string;
  title: string;
  city: string;
  jobs: Array<IJobExperience>;
  virtualBench: number;
  resumes: string;
  id: UUID;
}
