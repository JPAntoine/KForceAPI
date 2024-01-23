import { CosmosPartitionKey } from '@nestjs/azure-database';

@CosmosPartitionKey('Company')
export class Job {
  id: string;
  imgUrl: string;
  Title: string;
  Flexibility: string;
  Description: string;
  Skills: Array<string>;
  Salary: string;
  Company: string;
  Location: ILocation;
  tags: Array<Tags>;
}

export interface Tags {
  name: string;
}

export interface ILocation {
  City: string;
  State: string;
}
