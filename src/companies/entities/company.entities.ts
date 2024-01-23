import { CosmosPartitionKey } from '@nestjs/azure-database';
import { UUID } from 'crypto';
import { ILocation } from 'src/jobs/entities/jobs.entity';

@CosmosPartitionKey('Name')
export class Company {
  Name: string;
  Location: ILocation;
  Profile: string;
  Website: string;
  'Company Size': string;
  Image: string;
  id: UUID;
}
