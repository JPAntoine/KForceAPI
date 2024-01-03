export const AppConstants = {
  allowedURL: process.env.allowedURL,
  aiEndpoint: process.env.AI_ENDPOINT,
  aiKey: process.env.AI_KEY,
  cosmosContainer: process.env.COSMOS_DB_CONTAINER_ID_DOCUMENT_DATA,
  cosmosDatabase: process.env.COSMOS_DB_ID,
  cosmosURI: process.env.COSMOS_URI,
  cosmosKey: process.env.COSMOS_KEY,
  isDev: process.env.isDev,
  processedDocumentContainerFolderName:
    process.env.STORAGE_CONTAINER_FOLDER_NAME_PROCESSED || 'processed',
};
