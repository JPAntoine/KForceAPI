import { AzureCosmosDbModule } from '@nestjs/azure-database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CandidatesModule } from './candidates/candidates.module';
import { CompaniesModule } from './companies/companies.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    JobsModule,
    CandidatesModule,
    CompaniesModule,
    ConfigModule.forRoot(),
    AzureCosmosDbModule.forRootAsync({
      useFactory: async () => ({
        dbName: 'KForce',
        endpoint: process.env.COSMOS_URI,
        key: process.env.COSMOS_KEY,
      }),
      imports: undefined,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
