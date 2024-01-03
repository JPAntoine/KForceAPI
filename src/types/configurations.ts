export interface IPipelineConfiguration {
  id: string;
  type: string;
  triggers: Array<ITriggers>;
  destinations: Array<IDestinations>;
}
export interface IUserMapping {
  userId: string;
  userName: string;
  tenantId: string;
  securityGroups: Array<string>;
}

export interface ITriggers {
  id: number;
  name: string;
  lifecycleState: string;
  queueName: string;
  uploadStorageConnectionString: string;
  uploadContainerId: string;
  uploadContainerUploadFolderName: string;
  uploadContainerProcessedFolderName: string;
}

export interface IDestinations {
  id: number;
  name: string;
  lifecycleState: string;
  queueName: string;
  restrictedToTriggers: Array<number>;
}

export interface ILoggerConfig {
  storageAccountName: string;
  storageAccountKey: string;
  storageContainerName: string;
}

export interface IDocumentOverviewType {
  documentType: string;
  displayOrder: number;
  color: string;
}
export interface IDashboardConfiguration {
  id: string;
  type: string;
  maximumDocumentTypeToDisplay: number;
  documentTypes: Array<IDocumentOverviewType>;
}

export interface IApplicationStateObject {
  id: string;
  type: string;
  applicationState: IApplicationState;
}

export interface IApplicationState {
  textClassificationTrainingStatus: ITextClassificationTrainingStatus;
  publishTextClassificationStatus: IPublishTextClassificationStatus;
}

export interface ITextClassificationTrainingStatus {
  isRunning: boolean;
  lastTrainedBy: string;
  lastTrainedAt: Date;
  lastTrainedAtTimestamp: number;
  lastTrainedStatus: string;
  lastStatusMessage: string;
  currentTrainingStatus: string;
  currentTrainingStartedAt: Date;
  currentTrainingTriggeredBy: string;
}

export interface IPublishTextClassificationStatus {
  isRunning: boolean;
  lastPublishedBy: string;
  lastPublishedAt: Date;
  lastPublishedAtTimestamp: number;
  lastPublishedStatus: string;
  lastStatusMessage: string;
  currentPublishingStatus: string;
  currentPublishingStartedAt: Date;
  currentPublishingTriggeredBy: string;
}
export interface IUserMappingConfig {
  id: string;
  type: string;
  userMapping: Array<IUserMapping>;
}
export interface IConfigRoot {
  type: string;
  id: string;
  configurations: Array<IConfiguration>;
}

export interface IConfiguration {
  id: string;
  textClassificationFlag: boolean;
  allowDocumentSplitting?: boolean;
  allowPageLevelClassification?: boolean;
  cognitiveResources: Array<any>;
  triggers: Array<ITriggers>;
  destinations: Array<IDestinations>;
  categoryTextClassification?: boolean;
}
export interface ILandingPageGridConfiguration {
  systemName: string;
  displayName: string;
  displayOrder: number;
  isEntity: boolean;
  isMetadata: boolean;
  isDefault?: boolean;
  queryFieldName?: string;
  isSortable?: boolean;
  excludeSpecialChars?: string;
}
