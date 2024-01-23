import { HttpModule } from '@nestjs/axios';
import { AzureCosmosDbModule } from '@nestjs/azure-database';
import { Module } from '@nestjs/common';
import { CandidatesController } from './controllers/candidates.controller';
import { Candidate } from './entities/candidate.entity';
import { CandidatesService } from './services/candidates.service';

@Module({
  imports: [
    AzureCosmosDbModule.forFeature([
      { collection: 'Candidates', dto: Candidate },
    ]),
    HttpModule,
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
})
export class CandidatesModule {}
