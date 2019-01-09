[![NPM version][npm-image]][npm-url]
[![NPM quality][quality-image]][quality-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mongo-native.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mongo-native
[quality-image]: http://npm.packagequality.com/shield/egg-mongo-native.svg?style=flat-square
[quality-url]: http://packagequality.com/#?package=egg-mongo-native
[travis-image]: https://img.shields.io/travis/brickyang/egg-mongo-native.svg?branch=master&style=flat-square
[travis-url]: https://travis-ci.org/brickyang/egg-mongo-native
[codecov-image]: https://img.shields.io/codecov/c/github/brickyang/egg-mongo-native.svg?style=flat-square
[codecov-url]: https://codecov.io/github/brickyang/egg-mongo-native?branch=master
[david-image]: https://img.shields.io/david/brickyang/egg-mongo-native.svg?branch=master&style=flat-square
[david-url]: https://david-dm.org/brickyang/egg-mongo-native?branch=master
[snyk-image]: https://snyk.io/test/npm/egg-mongo-native/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mongo-native
[download-image]: https://img.shields.io/npm/dm/egg-mongo-native.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mongo-native

[**English**](https://github.com/brickyang/easy-mongodb/blob/master/README.md)

本插件基于
[node-mongodb-native](https://github.com/mongodb/node-mongodb-native)，提供了
MongoDB 官方 driver 及 API。

插件对一些常用 API 进行了简单封装以简化使用，同时保留了所有原版属性。例如，使用原版 API 进行一次查找需要写

```js
db.collection('name')
  .find(query, options)
  .skip(skip)
  .limit(limit)
  .project(project)
  .sort(sort)
  .toArray();
```

封装后

```js
mongo.find('name', { query, skip, limit, project, sort, options });
```

此插件完全支持 Promise，并强烈推荐使用 async/await。

如果你正在使用 Egg.js，请使用插件 [egg-mongo-native](https://github.com/brickyang/egg-mongo-native)。

## 安装

```bash
npm install --save @brickyang/easy-mongodb
```

## 配置

### 单实例

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

### 副本集

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

## 使用示例

本插件提供的 API 只是对原版 API 进行了必要的简化，所有属性名称与原版 API 一致。所有针对文档操作的 API，通常接受 2 个参数，第一个参数是 collection 名称，第二个参数是一个对象，属性名即为原版 API 的所有参数。例如，使用原版 API 进行一次插入

```js
const MongoDB = require('@brickyang/easy-mongodb');

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

## 属性

- **db**：已连接的数据库实例
- **client**: MongoClient 实例
- **featureCompatibilityVersion**: '4.0' 以上支持事物

## API

目前插件提供的 API 包括：

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

当然，在任何时候你也都可以使用 `mongo.db` 和 `mongo.client` 调用所有 API。在这里查看所有
API：[Node.js MongoDB Driver API](http://mongodb.github.io/node-mongodb-native/3.1/api/)。

## Promise

```js
function create(doc) {
  mongo
    .insertOne('name', { doc })
    .then(result => console.log(result))
    .catch(error => console.error(error));
}
```

### Async/Await

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

如果你使用 `mongo.db` 调用原版 API，则也可以使用回调函数。插件封装的 API 不支持回调函数，因为 Promise 和 async/await 更加优雅。

Node.js 7.6 开始已经原生支持 async/await，不再需要 Babel。

## License

[MIT](LICENSE)
