import EventEmitter from 'events';
import {
  Collection,
  CollectionAggregationOptions,
  CollectionCreateOptions,
  CollectionInsertManyOptions,
  CollectionInsertOneOptions,
  CommonOptions,
  Cursor,
  Db,
  DeleteWriteOpResultObject,
  FindAndModifyWriteOpResultObject,
  FindOneAndReplaceOption,
  FindOneOptions,
  IndexOptions,
  InsertOneWriteOpResult,
  InsertWriteOpResult,
  MongoCallback,
  MongoClientOptions,
  MongoCountPreferences,
  ReadPreference,
  UpdateWriteOpResult,
  MongoClient,
  FindOneOptions,
  SessionOptions,
  ClientSession,
  TransactionOptions,
} from 'mongodb';
import { deprecate } from 'util';

export { ObjectId, ObjectID } from 'mongodb';

type Default = any;

declare class MongoDB {
  public config: IMongoConfig;
  private url: string;
  private clientOptions: MongoClientOptions;
  public db: Db;
  public client: MongoClient;
  public featureCompatibilityVersion: string;

  constructor(config: IMongoConfig);

  public connect(): Promise<MongoClient>;

  public close(): Promise<void>;

  public insertOne(
    name: string,
    args: { doc: Object; options?: CollectionInsertOneOptions }
  ): Promise<InsertOneWriteOpResult>;

  public insertMany(
    name: string,
    args: { docs: Object[]; options?: CollectionInsertManyOptions }
  ): Promise<InsertWriteOpResult>;

  public findOne<T = Default>(
    name: string,
    args: { query: object; options?: FindOneOptions }
  ): Promise<T | null>;

  public findOneAndUpdate<T = Default>(
    name: string,
    args: {
      filter: Object;
      update: Object;
      options?: FindOneAndReplaceOption;
    }
  ): Promise<FindAndModifyWriteOpResultObject<T>>;

  public findOneAndReplace<T = Default>(
    name: string,
    args: {
      filter: Object;
      replacement: Object;
      options?: FindOneAndReplaceOption;
    }
  ): Promise<FindAndModifyWriteOpResultObject<T>>;

  public findOneAndDelete<T = Default>(
    name: string,
    args: {
      filter: Object;
      options?: {
        projection?: Object;
        sort?: Object;
        maxTimeMS?: number;
        session?: ClientSession;
      };
    }
  ): Promise<FindAndModifyWriteOpResultObject<T>>;

  public updateMany(
    name: string,
    args: {
      filter: Object;
      update: Object;
      options?: CommonOptions & { upsert?: boolean };
    }
  ): Promise<UpdateWriteOpResult>;

  public deleteMany(
    name: string,
    args: { filter: Object; options?: CommonOptions }
  ): Promise<DeleteWriteOpResultObject>;

  public find<T = Default>(
    name: string,
    args: {
      query?: any;
      skip?: number;
      limit?: number;
      projection?: any;
      project?: any;
      sort?: { [key: string]: number };
      options?: FindOneOptions;
    },
    returnCursor: true
  ): Promise<Cursor<T>>;

  public find<T = Default>(
    name: string,
    args?: {
      query?: any;
      skip?: number;
      limit?: number;
      projection?: any;
      project?: any;
      sort?: { [key: string]: number };
      options?: FindOneOptions;
    },
    returnCursor?: boolean
  ): Promise<T[]>;

  @deprecate
  public count(
    name: string,
    args?: {
      query?: any;
      options?: MongoCountPreferences;
    }
  ): Promise<number>;

  public countDocuments(
    name: string,
    args: {
      query?: any;
      options?: MongoCountPreferences;
    }
  ): Promise<number>;

  public estimatedDocumentCount(
    name: string,
    args?: {
      query?: any;
      options?: MongoCountPreferences;
    }
  ): Promise<number>;

  public distinct(
    name: string,
    args: {
      key: string;
      query?: Object;
      options?: {
        readPreference?: ReadPreference | string;
        maxTimeMS?: number;
        session?: ClientSession;
      };
    }
  ): Promise<any[]>;

  public createIndex(
    name: string,
    args: { fieldOrSpec: string | any; options?: IndexOptions }
  ): Promise<string>;

  public listCollections(args: {
    filter?: Object;
    options?: { batchSize?: number; readPreference?: ReadPreference | string };
  }): Promise<string[]>;

  public createCollection<T = Default>(args: {
    name: string;
    options?: CollectionCreateOptions;
  }): Promise<Collection<T>>;

  public aggregate<T = Default>(
    name: string,
    args: { pipeline: any[]; options?: CollectionAggregationOptions }
  ): Promise<T[]>;

  public startSession(args?: { options?: SessionOptions }): ClientSession;

  public startTransaction(args?: {
    options?: TransactionOptions;
  }): ClientSession;
}

export default MongoDB;

interface IMongoConfig {
  host?: string | string[];
  port?: string | number;
  name?: string;
  user?: string;
  password?: string;
  options?: MongoClientOptions;
}
