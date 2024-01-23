import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { IJobDto } from 'src/jobs/dtos/resJob.dto';
import { JobsService } from 'src/jobs/services/jobs.service';
import { IJobCandidateDto } from 'src/openAI/dtos/jobCandidate.dto';
import { AzureOpenAIService } from 'src/openAI/services/azureOpenAI.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private jobsService: JobsService,
    private azureOAService: AzureOpenAIService,
  ) {}

  @Get('/all')
  async getAllJobs(): Promise<Array<IJobDto>> {
    return this.jobsService.getAllJobs();
  }

  @Get()
  @ApiQuery({ name: 'jobName' })
  async getJobsAndCandidatesByMatch(
    @Query('jobName') jobName: string,
  ): Promise<Array<IJobCandidateDto>> {
    const jobs = await this.jobsService.getJobsByMatch(jobName);
    return await this.azureOAService.getCandidateMatches(jobs);
  }
}
