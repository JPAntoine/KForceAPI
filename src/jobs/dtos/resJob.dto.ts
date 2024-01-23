export class IJobDto {
  id: string;
  jobTitle: string;
  jobFlexibility: string;
  jobDescription: string;
  jobSalary: string;
  skills: Array<string>;
  company: string;
  location: ILocation;
}

class ILocation {
  City: string;
  State: string;
}
