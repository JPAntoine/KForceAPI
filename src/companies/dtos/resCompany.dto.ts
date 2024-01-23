import { UUID } from 'crypto';
import { ILocation } from 'src/jobs/entities/jobs.entity';

export class resCompanyDto {
  name: string;
  location: ILocation;
  description: string;
  websiteUrl: string;
  companySize: string;
  imagURl: string;
  id: UUID;
}
