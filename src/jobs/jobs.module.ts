import { HttpModule } from '@nestjs/axios';
import { AzureCosmosDbModule } from '@nestjs/azure-database';
import { Module } from '@nestjs/common';
import { JobsController } from 'src/jobs/controllers/jobs.controller';
import { Job } from 'src/jobs/entities/jobs.entity';
import { JobsService } from 'src/jobs/services/jobs.service';
import { AzureOpenAIService } from 'src/openAI/services/azureOpenAI.service';

@Module({
  imports: [
    AzureCosmosDbModule.forFeature([
      { collection: 'JobRequestions', dto: Job },
    ]),
    HttpModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, AzureOpenAIService],
})
export class JobsModule {}
