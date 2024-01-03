import { AppConstants } from 'src/constants';
import { Injectable } from '@nestjs/common';
import { DIPCosmosDB } from './cosmos';

@Injectable()
export class DocumentCosmosDB extends DIPCosmosDB {
  constructor() {
    super(AppConstants.cosmosContainer);
  }
}
