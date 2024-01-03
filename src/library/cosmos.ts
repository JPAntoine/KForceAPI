import { CosmosClient, Container, QueryIterator } from '@azure/cosmos';
import { AppConstants } from 'src/constants';

export class DIPCosmosDB {
  public container: Container;
  public client: CosmosClient;
  constructor(containername: string) {
    this.createOrResetConnection(containername);
  }

  public createOrResetConnection(containername: string) {
    try {
      this.client = new CosmosClient({
        endpoint: AppConstants.cosmosURI,
        key: AppConstants.cosmosKey,
      });

      this.container = this.client
        .database(AppConstants.cosmosDatabase)
        .container(containername);
    } catch (err) {
      console.error(
        `cosmos.ts: createOrResetConnection: caught an exception, tried using key values of:`,
        {
          cosmosdb: AppConstants.cosmosDatabase,
          containername: containername,
          endpoint: AppConstants.cosmosURI,
          key: AppConstants.cosmosKey,
        },
      );

      throw err;
    }
  }

  public getItems<T>(query: string): QueryIterator<T> {
    //console.log(`cosmos.ts: getItems: Entering, to execute query:`, { query: query });

    try {
      return this.container.items.query(query);
    } catch (err) {
      console.error(
        `cosmos.ts: getItems: caught an exception querying a container, details:`,
        {
          containerUrl: this.container?.url,
          query: query,
        },
      );
    }
  }

  public getItem<T>(id: string, type = 'instance') {
    return this.container.item(id, type);
  }

  public async replaceCollectionItem<T>(item: T) {
    const response = await this.container.item(item['id']).replace(item);

    return response.resource;
  }

  public async replaceItem<T>(item: T, type = 'instance') {
    const response = await this.container.item(item['id'], type).replace(item);

    return response.resource;
  }
  public async deleteItem<T>(item: T, type = 'instance') {
    const { resource: result } = await this.container
      .item(item['id'], type)
      .delete();
    console.log(result);
  }

  public async addItem<T>(item: T) {
    const { resource: responses } = await this.container.items.upsert(item);
    return responses;
  }
}
