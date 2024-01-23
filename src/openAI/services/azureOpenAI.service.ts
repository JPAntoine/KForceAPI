import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { IJobDto } from 'src/jobs/dtos/resJob.dto';
import { IJobCandidateDto } from 'src/openAI/dtos/jobCandidate.dto';
import { reqOpenAiDto } from 'src/openAI/dtos/reqOpenAi.dto';
import { PotentialCandidate } from 'src/openAI/entities/potentialCandidate.entity';
@Injectable()
export class AzureOpenAIService {
  constructor(private readonly httpService: HttpService) {}

  async getCandidateMatches(
    jobs: Array<IJobDto>,
  ): Promise<Array<IJobCandidateDto>> {
    const updatedJobs: Array<IJobCandidateDto> = await Promise.all(
      jobs.map(async (job) => {
        const question = `List the all the candidates based on the following required skills.  ['${job.skills.join(
          "', '",
        )}']`;
        const prompt = `Rate the best canidates for the following job title ${job.jobTitle}`;
        const body: reqOpenAiDto = {
          question,
          prompt,
        };

        const req = await firstValueFrom(
          this.httpService
            .post(process.env.AI_ENDPOINT, body, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.AI_KEY}`,
                'azureml-model-deployment': 'kforce-demo-v2-1-10-2024-3',
              },
            })
            .pipe(
              catchError((error) => {
                throw `An error happened. Msg: ${JSON.stringify(
                  error?.response?.data,
                )}`;
              }),
            ),
        );

        const candidates: Array<PotentialCandidate> =
          req.data?.output.Candidates.map((candidate) => ({
            description: candidate.Description,
            docName: candidate['Document Name'],
            name: candidate.Name,
            score: candidate.Score,
            yoE: candidate['Years of Experience'],
          })).sort((n1, n2) => n2.score - n1.score);

        const ret: IJobCandidateDto = {
          job: job,
          candidates: candidates,
        };
        return ret;
      }),
    );

    return updatedJobs;
  }
}
