import { PotentialCandidate } from 'src/openAI/entities/potentialCandidate.entity';
import { IJobDto } from '../../jobs/dtos/resJob.dto';

export interface IJobCandidateDto {
  job: IJobDto;
  candidates: Array<PotentialCandidate>;
}
