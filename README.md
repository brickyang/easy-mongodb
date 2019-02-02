[![NPM version][npm-image]][npm-url]
[![NPM quality][quality-image]][quality-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@brickyang/easy-mongodb.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@brickyang/easy-mongodb
[quality-image]: http://npm.packagequality.com/shield/@brickyang/easy-mongodb.svg?style=flat-square
[quality-url]: http://packagequality.com/#?package=@brickyang/easy-mongodb
[travis-image]: https://img.shields.io/travis-ci/brickyang/easy-mongodb.svg?style=flat-square
[travis-url]: https://travis-ci.org/brickyang/easy-mongodb
[codecov-image]: https://img.shields.io/codecov/c/github/brickyang/easy-mongodb.svg?style=flat-square
[codecov-url]: https://codecov.io/github/brickyang/easy-mongodb?branch=master
[david-image]: https://david-dm.org/brickyang/easy-mongodb/status.svg?style=flat-square
[david-url]: https://david-dm.org/brickyang/easy-mongodb?branch=master
[snyk-image]: https://snyk.io/test/npm/@brickyang/easy-mongodb/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/@brickyang/easy-mongodb
[download-image]: https://img.shields.io/npm/dm/@brickyang/easy-mongodb.svg?style=flat-square
[download-url]: https://npmjs.org/package/@brickyang/easy-mongodb

[**中文版**](https://github.com/brickyang/easy-mongodb/blob/master/README.zh_CN.md)

This lib base on
[node-mongodb-native](https://github.com/mongodb/node-mongodb-native), provides
the official MongoDB native driver and APIs.

It wraps some frequently-used API to make it easy to use but keep all properties
as it is. For example, to find a document you need this with official API

```js
db.collection('name')
  .find(query, options)
  .skip(skip)
  .limit(limit)
  .project(project)
  .sort(sort)
  .toArray();
```

and with this lib

```js
mongo.find('name', { query, skip, limit, project, sort, options });
```

If you are using Egg.js, please see [egg-mongo-native](https://github.com/brickyang/egg-mongo-native).

## Installation

```bash
npm install --save @brickyang/easy-mongodb
```

## Configuration

### Single

```js
const config = {
  host: 'host',
  port: 'port',
  name: 'test',
  user: 'user',
  password: 'password',
  options: {},
};
```

### Replica Set

```js
// mongodb://host1:port1,host2:port2/name?replicaSet=test
const config = {
  host: 'host1,host2',
  port: 'port1,port2',
  name: 'name',
  options: { replicaSet: 'test' },
};

// mongodb://host:port1,host:port2/name?replicaSet=test
const config = {
  host: 'host',
  port: 'port1,port2',
  name: 'name',
  options: { replicaSet: 'test' },
};
```

## Usage

The APIs provided by this lib usually need two arguments. The first is commonly
the collection name, and the second is an object keeps the arguments of official
API.

```js
// TypeScript
// import MongoDB from '@brickyang/easy-mongodb';

const MongoDB = require('@brickyang/easy-mongodb').default;

const mongo = new MongoDB(config);

// connection
mongo
  .connect()
  .then(client => {
    // `client` is instance of connected MongoClient
  })
  .catch(error => {
    // handle error
  });

// or

mongo.on('connect', () => {
  // do something
});

mongo.on('error', error => {
  // handle error
});

// insert one doc
const args = { doc, options };
mongo.insertOne('collection', args);

// transaction
const session = mongo.startTransaction();
const args = { doc, { session } };
mongo.insertOne('collection1', args);
mongo.insertOne('collection2', args);
session.commitTransaction();
```

## Members

- **db**: Db instance
- **client**: MongoClient instance
- **featureCompatibilityVersion**: Transaction need '4.0' or above

## API

Until now, this plugin provides these functions:

- **connect**
- **insertOne**
- **insertMany**
- **findOne**
- **findOneAndUpdate**
- **findOneAndReplace**
- **findOneAndDelete**
- **updateMany**
- **deleteMany**
- **find**
- **count**: 已过时
- **countDocuments**
- **estimatedDocumentCount**
- **distinct**
- **createIndex**
- **listCollection**
- **createCollection**
- **aggregate**
- **startSession**
- **startTransaction**

You can always use `mongo.db` and `mongo.client` to use all official APIs. Check the
APIs here:
[Node.js MongoDB Driver API](https://mongodb.github.io/node-mongodb-native/3.1/api/).

## Promise

```js
function create(doc) {
  mongo
    .insertOne('name', { doc })
    .then(result => console.log(result))
    .catch(error => console.error(error));
}
```

## Async/Await

```js
async function create(doc) {
  try {
    const result = await mongo.insertOne('name', { doc });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

If you use `mongo.db` you could use callback(usually the last argument), but
this lib doesn't support callback because Promise and async/await are better.

## License

[MIT](LICENSE)
