import { HttpModule } from '@nestjs/axios';
import { AzureCosmosDbModule } from '@nestjs/azure-database';
import { Module } from '@nestjs/common';
import { CompaniesController } from './controllers/companies.controller';
import { Company } from './entities/company.entities';
import { CompaniesService } from './services/companies.service';

@Module({
  imports: [
    AzureCosmosDbModule.forFeature([{ collection: 'Companies', dto: Company }]),
    HttpModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
