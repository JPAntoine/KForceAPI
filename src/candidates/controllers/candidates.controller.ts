import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { resCandidateDto } from '../dtos/resCandidate.dto';
import { CandidatesService } from '../services/candidates.service';

@Controller('candidates')
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Get()
  @ApiQuery({ name: 'candidateName' })
  async getCandidateByName(
    @Query('candidateName') jobName: string,
  ): Promise<resCandidateDto> {
    return await this.candidatesService.getByName(jobName);
  }
}
