import { constants } from './constants';
import { AxiosRequestConfig, AxiosPromise } from 'axios';
import { IAIServices } from 'src/viewModels/aiServices';
import { AppConstants } from 'src/constants';
const { QueueServiceClient } = require('@azure/storage-queue');
import { caching, MemoryCache } from 'cache-manager';
import { axiosInstance } from 'src/interceptors/axios.interceptor';
import { DefaultAzureCredential } from '@azure/identity';

const AuthenticationContext = require('adal-node').AuthenticationContext;
const clientId = AppConstants.clientId;
const clientSecret = AppConstants.clientSecret;
const authorityHostUrl = AppConstants.authorityHostUrl;
const tenant = AppConstants.tenantId;
const platformResourceId = AppConstants.platformResourceId;
let memoryCache: MemoryCache;
caching('memory', {
  ttl: Number(AppConstants.cacheExpirationTime),
}).then((res) => (memoryCache = res));
export class ServiceHelper {
  static addToCache = async (
    key: string,
    item: string,
    ttl: number = Number(AppConstants.cacheExpirationTime),
  ) => {
    try {
      if (AppConstants.enableCache === 'true')
        await memoryCache.set(key, item, ttl);
    } catch (error) {
      console.error(error);
    }
  };

  static getFromCache = async (key: string) => {
    try {
      if (AppConstants.enableCache === 'true') {
        return await memoryCache.get(key);
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  };

  public static handleThrottling = (
    aiServicesConfig?: IAIServices,
    url?: string,
  ) => {
    return new Promise<void>((resolve, reject) => {
      if (aiServicesConfig && url) {
        let aiService = aiServicesConfig?.services.find((aiService) => {
          let serviceURL = process.env[aiService.serviceEndpointSettings];
          return url.indexOf(serviceURL) >= 0;
        });
        if (aiService) {
          //console.log("Throttling is being considered for " + aiService.serviceName);
          let connectionString =
            process.env.STORAGE_ACCOUNT_CONNECTION_STRING_THROTTLING ||
            process.env.STORAGE_ACCOUNT_CONNECTION_STRING_PROCESSING;
          let queueServiceClient =
            QueueServiceClient.fromConnectionString(connectionString);
          let queueClient = queueServiceClient.getQueueClient(
            aiService.queueName,
          );
          queueClient
            .receiveMessages({
              numberOfMessages: 1,
              visibilityTimeout: Number(aiService.periodTimeoutInSeconds),
              timeoutInSeconds: 1,
            })
            .then((response) => {
              //context.log(response.receivedMessageItems);
              if (response.receivedMessageItems?.length > 0) {
                //console.log("Throttling - Ready for Processing: " + aiService.serviceName);
                resolve();
              } else {
                // no transactions available, try again in 200ms (queues open back up after 1 second)
                //console.log(`Request throttled for: ${aiService.serviceName}. Trying again in ${aiService.msDelayBeforeRetry}ms`);
                setTimeout(() => {
                  ServiceHelper.handleThrottling(aiServicesConfig, url)
                    .then((result) => {
                      resolve();
                    })
                    .catch((err) => {
                      reject(err);
                    });
                }, Number(aiService.msDelayBeforeRetry));
              }
            })
            .catch((err) => {
              console.log('Error while handling throttling');
              console.log(err);
              reject(err);
            });
        } else {
          // resolve since this request doesn't related to a throttled service
          console.log(
            "Throttling not considered: request doesn't related to a throttled service",
          );
          resolve();
        }
      } else {
        // resolve since the request didn't provide the requisite throttling data
        //console.log("Throttling not considered: request didn't provide the requisite throttling data");
        resolve();
      }
    });
  };

  public static handleServiceError = (err: any) => {
    if (err && err.response) {
      if (err.response.status === 401) {
        const message =
          (err.response.data &&
            err.response.data.error &&
            err.response.data.error.message) ||
          'Please make sure the API key is correct.';
        throw new AppError(
          ErrorCode.HttpStatusUnauthorized,
          message,
          'Permission Denied',
        );
      } else if (err.response.status === 404) {
        throw new AppError(
          ErrorCode.HttpStatusNotFound,
          'Please make sure the service endpoint is correct.',
          'Endpoint not found',
        );
      } else if (err.response.status === 429) {
        const response = err.response;
        let errorCode = ErrorCode.Unknown;
        let errorMessage = '';
        let errorTitle = '';
        if (
          response.data &&
          response.data.error &&
          response.data.error.code === '1014'
        ) {
          errorCode = ErrorCode.ModelCountLimitExceeded;
          errorMessage =
            'The number of models associated with the given API key has exceeded the maximum allowed value.';
          errorTitle = 'Too many models';
        } else {
          errorCode = ErrorCode.HttpStatusTooManyRequests;
          errorMessage =
            "We've got too many requests in a short period of time. Please try again later.";
          errorTitle = 'Too many requests';
        }
        throw new AppError(errorCode, errorMessage, errorTitle);
      } else if (
        err.response.data &&
        err.response.data.error &&
        err.response.data.error.code === '1001'
      ) {
        throw new AppError(
          ErrorCode.ModelNotFound,
          err.response.data.error.message,
        );
      } else if (
        err.response.data &&
        err.response.data.error &&
        err.response.data.error.message
      ) {
        throw new AppError(ErrorCode.Unknown, err.response.data.error.message);
      } else {
        throw new AppError(
          ErrorCode.Unknown,
          'An error occurred in the service. Please try again later.',
          'Error',
        );
      }
    } else {
      // Network Error
      throw new AppError(
        ErrorCode.HttpStatusNotFound,
        'Cannot resolve the host name. Please make sure the service endpoint is correct.',
        'Endpoint not found',
      );
    }
  };

  static getAccessToken = () => {
    const authorityUrl = authorityHostUrl + '/' + tenant;
    const context = new AuthenticationContext(authorityUrl);
    let accessTokenPromise = new Promise((resolve, reject) => {
      return context.acquireTokenWithClientCredentials(
        platformResourceId,
        clientId,
        clientSecret,
        function tokenCallback(err, tokenResponse) {
          if (err) {
            console.log('Failed to retrive the access token:' + err.stack);
            reject('');
          } else {
            resolve(tokenResponse.accessToken);
          }
        },
      );
    });

    return accessTokenPromise;
  };

  static getMSIAccessToken = async (audienceId: string) => {
    try {
      const credential = new DefaultAzureCredential(); // system-assigned identity
      let token = await credential.getToken(audienceId);
      console.log(`token created: ${JSON.stringify(token)}`);
      if (token && token.token) {
        await ServiceHelper.addToCache('accessToken', token.token, 3000000); // 50 mins expiration
        return token.token;
      } else {
        return '';
      }
    } catch (err) {
      console.log(`Failed to generate MSI token with error: ${err}`);
    }
  };

  public static get = <T = any>(url: string): AxiosPromise<T> =>
    ServiceHelper.sendRequestWithAutoRetry(() => axiosInstance.get(url));

  public static postWithAutoRetry = <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    apiKey?: string,
    aiServicesConfig?: IAIServices,
  ): AxiosPromise<T> => {
    config =
      config && config.headers
        ? config
        : { headers: { 'Content-Type': 'application/json' } };
    return ServiceHelper.sendRequestWithAutoRetry(
      () =>
        axiosInstance.post(
          url,
          data,
          ServiceHelper.applyApiKey(config, apiKey),
        ),
      aiServicesConfig,
      url,
    );
  };

  public static getWithAutoRetry = <T = any>(
    url: string,
    config?: AxiosRequestConfig,
    apiKey?: string,
    aiServicesConfig?: IAIServices,
  ): AxiosPromise<T> => {
    config =
      config && config.headers
        ? config
        : { headers: { 'Content-Type': 'application/json' } };
    return ServiceHelper.sendRequestWithAutoRetry(
      () => axiosInstance.get(url, ServiceHelper.applyApiKey(config, apiKey)),
      aiServicesConfig,
      url,
    );
  };

  public static putWithAutoRetry = <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    apiKey?: string,
    aiServicesConfig?: IAIServices,
  ): AxiosPromise<T> =>
    ServiceHelper.sendRequestWithAutoRetry(
      () =>
        axiosInstance.put(url, data, ServiceHelper.applyApiKey(config, apiKey)),
      aiServicesConfig,
      url,
    );

  public static deleteWithAutoRetry = <T = any>(
    url: string,
    config?: AxiosRequestConfig,
    apiKey?: string,
    aiServicesConfig?: IAIServices,
  ): AxiosPromise<T> => {
    config =
      config && config.headers
        ? config
        : { headers: { 'Content-Type': 'application/json' } };
    return ServiceHelper.sendRequestWithAutoRetry(
      () =>
        axiosInstance.delete(url, ServiceHelper.applyApiKey(config, apiKey)),
      aiServicesConfig,
      url,
    );
  };

  private static applyApiKey = (
    config?: AxiosRequestConfig,
    apiKey?: string,
  ) => ({
    ...config,
    headers: {
      ...config.headers,
      ...(apiKey ? { [constants.apiKeyHeader]: apiKey } : {}),
    },
  });

  private static sendRequestWithAutoRetry = async <T>(
    request: () => AxiosPromise<T>,
    aiServicesConfig?: IAIServices,
    url?: string,
  ) => {
    let currentRetry = 0;
    while (true) {
      try {
        await ServiceHelper.handleThrottling(aiServicesConfig, url);
        return await request();
      } catch (err) {
        currentRetry++;
        if (
          currentRetry > constants.maxRetry ||
          !ServiceHelper.isTransient(err)
        ) {
          throw err;
        }

        await delay(
          constants.initialRetryInterval * Math.pow(2, currentRetry - 1),
        );
      }
    }
  };

  private static isTransient = (err) => {
    if (err && err.response) {
      const response = err.response;
      if (
        response.status === 429 &&
        response.data &&
        response.data.error &&
        response.data.error.code === '1014'
      ) {
        return false;
      }
      return [408, 429, 444, 500, 503, 504].includes(err.response.status);
    }
    return false;
  };
}

export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export class AppError extends Error implements IAppError {
  public errorCode: ErrorCode;
  public message: string;
  public title?: string;

  constructor(errorCode: ErrorCode, message: string, title: string = null) {
    super(message);
    this.errorCode = errorCode;
    this.message = message;
    this.title = title;
  }
}

export interface IAppError {
  errorCode: ErrorCode;
  message: any;
  title?: string;
}

export enum ErrorCode {
  // Note that the value of the enum is in camelCase while
  // the enum key is in Pascal casing
  Unknown = 'unknown',
  GenericRenderError = 'genericRenderError',
  ProjectInvalidJson = 'projectInvalidJson',
  ProjectInvalidSecurityToken = 'projectInvalidSecurityToken',
  ProjectDuplicateName = 'projectDuplicateName',
  SecurityTokenNotFound = 'securityTokenNotFound',
  OverloadedKeyBinding = 'overloadedKeyBinding',
  BlobContainerIONotFound = 'blobContainerIONotFound',
  BlobContainerIOForbidden = 'blobContainerIOForbidden',
  PredictWithoutTrainForbidden = 'predictWithoutTrainForbidden',
  ModelNotFound = 'modelNotFound',
  ModelCountLimitExceeded = 'modelCountLimitExceeded',
  HttpStatusUnauthorized = 'unauthorized',
  HttpStatusNotFound = 'notFound',
  HttpStatusTooManyRequests = 'tooManyRequests',
}
