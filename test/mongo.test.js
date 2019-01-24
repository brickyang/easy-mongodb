const { ObjectID } = require('mongodb');
const MongoDB = require('../index');
const assert = require('assert');

describe('test/mongo.test.js', () => {
  let NAME;
  let config;
  let mongo;
  let version;
  before(async () => {
    NAME = 'test';
    config = {
      host: 'localhost',
      port: 27019,
      name: 'test',
    };
    mongo = new MongoDB(config);
    await mongo.connect();
    const {
      featureCompatibilityVersion,
    } = await mongo.db.executeDbAdminCommand({
      getParameter: 1,
      featureCompatibilityVersion: 1,
    });
    version = parseFloat(featureCompatibilityVersion);

    /*eslint no-console: 0 */
    console.log(version);
  });

  afterEach(async () => await mongo.deleteMany(NAME, { filter: {} }));
  after(async () => await mongo.close());

  describe('connect()', () => {
    it('should OK', async () => {
      mongo.on('connect', () => {
        assert.ok(mongo.client.isConnected());
      });
    });
  });

  describe('insertOne()', () => {
    it('should success', async () => {
      const doc = { title: 'new doc' };
      const result = await mongo.insertOne(NAME, { doc });

      const {
        insertedCount,
        insertedId,
        ops,
        connection,
        result: { ok, n },
      } = result;
      assert.equal(insertedCount, 1);
      assert.equal(typeof insertedId, 'object');
      assert(ops[0].hasOwnProperty('_id'));
      assert.equal(ops[0].title, 'new doc');
      assert.equal(typeof connection, 'object');
      assert.equal(ok, 1);
      assert.equal(n, 1);
    });

    it('should insert empty document success', async () => {
      const result = await mongo.insertOne(NAME);
      const {
        insertedCount,
        insertedId,
        ops,
        connection,
        result: { ok, n },
      } = result;
      assert.equal(insertedCount, 1);
      assert.equal(typeof insertedId, 'object');
      assert(ops[0].hasOwnProperty('_id'));
      assert.equal(typeof connection, 'object');
      assert.equal(ok, 1);
      assert.equal(n, 1);
    });
  });

  describe('insertMany()', () => {
    it('should success', async () => {
      const docs = [{ title: 'doc1' }, { title: 'doc2' }, { title: 'doc3' }];
      const result = await mongo.insertMany(NAME, { docs });

      const {
        insertedCount,
        insertedIds,
        ops,
        result: { ok, n },
      } = result;
      assert.equal(insertedCount, 3);
      assert.equal(typeof insertedIds, 'object');
      assert.equal(Object.keys(result.insertedIds).length, 3);
      assert(Array.isArray(ops));
      assert.equal(ops.length, 3);
      assert.equal(ok, 1);
      assert.equal(n, 3);
    });

    it('should error with null args', async () => {
      try {
        await mongo.insertMany(NAME);
      } catch (error) {
        assert(error instanceof Error);
        assert(error.name === 'MongoError');
      }
    });

    it('should error with non-array docs', async () => {
      try {
        await mongo.insertMany(NAME, { docs: 'docs' });
      } catch (error) {
        assert(error instanceof Error);
        assert(error.name === 'MongoError');
      }
    });
  });

  describe('findOne()', () => {
    beforeEach(
      async () =>
        await mongo.insertMany(NAME, {
          docs: [
            { index: 1, type: 'doc' },
            { index: 2, type: 'doc' },
            { index: 3, type: 'doc' },
          ],
        })
    );

    it('should success', async () => {
      const result = await mongo.findOne(NAME, {
        query: { type: 'doc' },
      });
      assert.equal(result.index, 1);
      assert.equal(result.type, 'doc');
    });

    it('should success with projection', async () => {
      const result = await mongo.findOne(NAME, {
        options: { projection: { index: 1 } },
      });
      assert(result.hasOwnProperty('index'));
      assert(!result.hasOwnProperty('type'));
    });

    it('should success with sort', async () => {
      const result = await mongo.findOne(NAME, {
        options: { sort: { index: -1 } },
      });
      assert.equal(result.index, 3);
    });

    it('should success with empty args', async () => {
      const result = await mongo.findOne(NAME);
      assert.equal(result.index, 1);
      assert.equal(result.type, 'doc');
    });

    it('should success when document not found', async () => {
      const result = await mongo.findOne(NAME, { query: { index: 0 } });
      assert.equal(result, null);
    });
  });

  describe('findOneAndUpdate()', () => {
    let _id;
    let docs;
    beforeEach(async () => {
      docs = [
        { index: 1, title: 'new doc' },
        { index: 2, title: 'new doc' },
        { index: 3, title: 'new doc' },
      ];
      const result = await mongo.insertMany(NAME, { docs });
      _id = result.insertedIds[0];
    });

    it('should success', async () => {
      const filter = { _id };
      const update = { $set: { title: 'update doc' } };
      const result = await mongo.findOneAndUpdate(NAME, { filter, update });

      const {
        value,
        ok,
        lastErrorObject: { n, updatedExisting },
      } = result;
      assert.deepEqual(value._id, _id);
      assert.equal(value.title, 'new doc');
      assert.equal(ok, 1);
      assert.equal(n, 1);
      assert(updatedExisting);
    });

    it('should success and return updated', async () => {
      const result = await mongo.findOneAndUpdate(NAME, {
        filter: { _id },
        update: { $set: { title: 'update doc' } },
        options: { returnOriginal: false },
      });

      const {
        value,
        ok,
        lastErrorObject: { n, updatedExisting },
      } = result;
      assert.deepEqual(value._id, _id);
      assert.equal(value.title, 'update doc');
      assert.equal(ok, 1);
      assert.equal(n, 1);
      assert(updatedExisting);
    });

    it('should success with sort', async () => {
      const result = await mongo.findOneAndUpdate(NAME, {
        filter: { _id },
        update: { $set: { title: 'update doc' } },
        options: { sort: { _id: 1 } },
      });
      const {
        value,
        ok,
        lastErrorObject: { n, updatedExisting },
      } = result;
      assert.deepEqual(value._id, _id);
      assert.equal(ok, 1);
      assert.equal(n, 1);
      assert(updatedExisting);
    });

    it('should upsert', async () => {
      const result = await mongo.findOneAndUpdate(NAME, {
        filter: { title: 'upsert' },
        update: { $setOnInsert: { title: 'upsert' } },
        options: { upsert: true, returnOriginal: false },
      });

      const {
        value,
        ok,
        lastErrorObject: { n, updatedExisting, upserted },
      } = result;
      assert(value);
      assert.equal(value.title, 'upsert');
      assert.equal(ok, 1);
      assert.equal(n, 1);
      assert(!updatedExisting);
      assert.deepEqual(upserted, value._id);
    });

    it('should error with empty filter', async () => {
      try {
        await mongo.findOneAndUpdate(NAME);
      } catch (error) {
        assert.equal(error.name, 'MongoError');
        assert.equal(error.message, 'filter parameter must be an object');
      }
    });

    it('should error with empty update', async () => {
      try {
        await mongo.findOneAndUpdate(NAME, { filter: {} });
      } catch (error) {
        assert.equal(error.name, 'MongoError');
        assert.equal(error.message, 'update parameter must be an object');
      }
    });
  });

  describe('findOneAndReplace()', () => {
    let _id;
    beforeEach(
      async () =>
        ({ insertedId: _id } = await mongo.insertOne(NAME, {
          doc: { title: 'new doc' },
        }))
    );

    it('should success', async () => {
      const result = await mongo.findOneAndReplace(NAME, {
        filter: { _id },
        replacement: { doc: 'replace' },
      });

      const {
        value,
        ok,
        lastErrorObject: { n, updatedExisting },
      } = result;
      assert.deepEqual(value._id, _id);
      assert.equal(value.title, 'new doc');
      assert.equal(ok, 1);
      assert.equal(n, 1);
      assert(updatedExisting);
    });

    it('should success and return replaced', async () => {
      const result = await mongo.findOneAndReplace(NAME, {
        filter: { _id: new ObjectID(_id) },
        replacement: { doc: 'replace' },
        options: { returnOriginal: false },
      });
      const {
        value,
        ok,
        lastErrorObject: { n, updatedExisting },
      } = result;
      assert.deepEqual(value._id, _id);
      assert(!result.value.hasOwnProperty('title'));
      assert.equal(value.doc, 'replace');
      assert.equal(ok, 1);
      assert.equal(n, 1);
      assert(updatedExisting);
    });

    it('should upsert', async () => {
      const result = await mongo.findOneAndReplace(NAME, {
        filter: { title: 'upsert' },
        replacement: { doc: 'replace' },
        options: { upsert: true, returnOriginal: false },
      });

      const {
        value,
        ok,
        lastErrorObject: { n, updatedExisting, upserted },
      } = result;
      assert.equal(ok, 1);
      assert.equal(n, 1);
      assert.equal(updatedExisting, false);
      assert.deepEqual(upserted, value._id);
    });

    it('should error with empty filter', async () => {
      try {
        await mongo.findOneAndReplace(NAME);
      } catch (error) {
        assert.equal(error.name, 'MongoError');
        assert.equal(error.message, 'filter parameter must be an object');
      }
    });

    it('should error with empty update', async () => {
      try {
        await mongo.findOneAndReplace(NAME, { filter: {} });
      } catch (error) {
        assert.equal(error.name, 'MongoError');
        assert.equal(error.message, 'replacement parameter must be an object');
      }
    });
  });

  describe('findOneAndDelete()', () => {
    let _id;
    beforeEach(async () => {
      const result = await mongo.insertMany(NAME, {
        docs: [{ title: 'new doc' }, { title: 'new doc' }],
      });
      _id = result.insertedIds[0];
    });

    it('should success', async () => {
      const result = await mongo.findOneAndDelete(NAME, {
        filter: { _id },
      });

      const {
        value,
        ok,
        lastErrorObject: { n },
      } = result;
      assert.deepEqual(value._id, _id);
      assert.equal(value.title, 'new doc');
      assert.equal(ok, 1);
      assert.equal(n, 1);
    });

    it('should success with sort', async () => {
      const result = await mongo.findOneAndDelete(NAME, {
        filter: {},
        options: { sort: { id: 1 } },
      });

      const {
        value,
        ok,
        lastErrorObject: { n },
      } = result;
      assert.deepEqual(value._id, _id);
      assert.equal(value.title, 'new doc');
      assert.equal(ok, 1);
      assert.equal(n, 1);
    });

    it('should error', async () => {
      try {
        await mongo.findOneAndDelete(NAME);
      } catch (error) {
        assert.equal(error.name, 'MongoError');
        assert.equal(error.message, 'filter parameter must be an object');
      }
    });
  });

  describe('updateMany()', async () => {
    beforeEach(
      async () =>
        await mongo.insertMany(NAME, {
          docs: [
            { title: 'doc1', type: 'doc' },
            { title: 'doc2', type: 'doc' },
            { title: 'doc3', type: 'text' },
            { title: 'doc4', type: 'text' },
          ],
        })
    );

    afterEach(async () => await mongo.deleteMany(NAME, { filter: {} }));

    it('should success', async () => {
      const result = await mongo.updateMany(NAME, {
        filter: { type: 'doc' },
        update: { $set: { type: 'update' } },
      });

      const {
        connection,
        matchedCount,
        modifiedCount,
        upsertedCount,
        upsertedId,
        result: { n, nModified, ok },
      } = result;
      assert(connection);
      assert.equal(matchedCount, 2);
      assert.equal(modifiedCount, 2);
      assert.equal(upsertedCount, 0);
      assert.equal(upsertedId, null);
      assert.equal(n, 2);
      assert.equal(nModified, 2);
      assert.equal(ok, 1);
    });

    it('should success all doc', async () => {
      const result = await mongo.updateMany(NAME, {
        filter: {},
        update: { $set: { type: 'update' } },
      });

      const {
        connection,
        matchedCount,
        modifiedCount,
        upsertedCount,
        upsertedId,
        result: { n, nModified, ok },
      } = result;
      assert(connection);
      assert.equal(matchedCount, 4);
      assert.equal(modifiedCount, 4);
      assert.equal(upsertedCount, 0);
      assert.equal(upsertedId, null);
      assert.equal(n, 4);
      assert.equal(nModified, 4);
      assert.equal(ok, 1);
    });

    it('should upsert', async () => {
      const result = await mongo.updateMany(NAME, {
        filter: { doc: 'doc5' },
        update: { $set: { type: 'update' } },
        options: { upsert: true },
      });

      const {
        connection,
        matchedCount,
        modifiedCount,
        upsertedCount,
        upsertedId: { _id },
        result: { n, nModified, ok },
      } = result;
      assert(connection);
      assert.equal(matchedCount, 0);
      assert.equal(modifiedCount, 0);
      assert.equal(upsertedCount, 1);
      assert(_id);
      assert.equal(n, 1);
      assert.equal(nModified, 0);
      assert.equal(ok, 1);
    });

    it('should error with no args', async () => {
      try {
        await mongo.updateMany(NAME);
      } catch (error) {
        assert(error);
      }
    });

    it('should error with no filter', async () => {
      try {
        await mongo.updateMany(NAME, {
          update: { $set: { type: 'update' } },
        });
      } catch (error) {
        assert.equal(
          error.message,
          'selector must be a valid JavaScript object'
        );
      }
    });

    it('should error with empty update', async () => {
      try {
        await mongo.updateMany(NAME, { filter: {}, update: {} });
      } catch (error) {
        assert.equal(
          error.message,
          'The update operation document must contain at least one atomic operator.'
        );
      }
    });
  });

  describe('deleteMany()', () => {
    beforeEach(
      async () =>
        await mongo.insertMany(NAME, {
          docs: [
            { title: 'doc1', type: 'doc' },
            { title: 'doc2', type: 'doc' },
            { title: 'doc3', type: 'text' },
            { title: 'doc4', type: 'text' },
          ],
        })
    );

    afterEach(async () => await mongo.deleteMany(NAME, { filter: {} }));

    it('should success', async () => {
      const result = await mongo.deleteMany(NAME, {
        filter: { type: 'doc' },
      });

      const {
        deletedCount,
        result: { n, ok },
      } = result;
      assert.equal(deletedCount, 2);
      assert.equal(n, 2);
      assert.equal(ok, 1);
    });

    it('should delete all', async () => {
      const result = await mongo.deleteMany(NAME, { filter: {} });

      const {
        deletedCount,
        result: { n, ok },
      } = result;
      assert.equal(deletedCount, 4);
      assert.equal(n, 4);
      assert.equal(ok, 1);
    });

    it('should error', async () => {
      try {
        await mongo.deleteMany(NAME);
      } catch (error) {
        assert.equal(error.message, 'filter parameter must be an object');
      }
    });
  });

  describe('find()', () => {
    beforeEach(
      async () =>
        await mongo.insertMany(NAME, {
          docs: [
            { index: 1, type: 'doc' },
            { index: 2, type: 'doc' },
            { index: 3, type: 'doc' },
          ],
        })
    );

    it('should success', async () => {
      const result = await mongo.find(NAME, {
        query: { type: 'doc' },
      });
      assert(Array.isArray(result));
      assert.equal(result.length, 3);
    });

    it('should success with limit', async () => {
      const result = await mongo.find(NAME, { limit: 1 });
      assert(Array.isArray(result));
      assert.equal(result.length, 1);
    });

    it('should success with skip', async () => {
      const result = await mongo.find(NAME, { skip: 1 });
      assert(Array.isArray(result));
      assert.equal(result.length, 2);
    });

    it('should success with projection', async () => {
      const result = await mongo.find(NAME, { projection: { index: 1 } });
      assert(result[0].hasOwnProperty('index'));
      assert(!result[0].hasOwnProperty('type'));
    });

    it('#DEPRECATED# should success with project', async () => {
      const result = await mongo.find(NAME, { project: { index: 1 } });
      assert(result[0].hasOwnProperty('index'));
      assert(!result[0].hasOwnProperty('type'));
    });

    it('should success with sort', async () => {
      const result = await mongo.find(NAME, { sort: { index: -1 } });
      assert(result[0].index > result[1].index);
      assert(result[1].index > result[2].index);
    });

    it('should success with empty args', async () => {
      const result = await mongo.find(NAME);
      assert(Array.isArray(result));
      assert.equal(result.length, 3);
    });

    it('should cursor', async () => {
      const result = await mongo.find(NAME, {}, true);
      assert.equal(typeof result, 'object');
    });
  });

  describe('count()', () => {
    beforeEach(
      async () =>
        await mongo.insertMany(NAME, {
          docs: [
            { type: 'doc' },
            { type: 'doc' },
            { type: 'text' },
            { type: 'text' },
          ],
        })
    );

    it('should  success', async () => {
      const result = await mongo.count(NAME, {
        query: { type: 'doc' },
      });
      assert.equal(result, 2);
    });

    it('should count all', async () => {
      const result = await mongo.count(NAME);
      assert.equal(result, 4);
    });
  });

  describe('countDocuments()', () => {
    beforeEach(
      async () =>
        await mongo.insertMany(NAME, {
          docs: [
            { type: 'doc' },
            { type: 'doc' },
            { type: 'text' },
            { type: 'text' },
          ],
        })
    );

    it('should  success', async () => {
      const result = await mongo.countDocuments(NAME, {
        query: { type: 'doc' },
      });
      assert.equal(result, 2);
    });

    it('should count all', async () => {
      const result = await mongo.countDocuments(NAME);
      assert.equal(result, 4);
    });
  });

  describe('estimatedDocumentCount()', () => {
    beforeEach(
      async () =>
        await mongo.insertMany(NAME, {
          docs: [
            { type: 'doc' },
            { type: 'doc' },
            { type: 'text' },
            { type: 'text' },
          ],
        })
    );

    it('should success', async () => {
      const result = await mongo.estimatedDocumentCount(NAME);
      assert.equal(result, 4);
    });
  });

  describe('distinct()', () => {
    beforeEach(
      async () =>
        await mongo.insertMany(NAME, {
          docs: [
            { type: 'doc' },
            { type: 'doc' },
            { type: 'text' },
            { type: 'text' },
          ],
        })
    );

    it('should success', async () => {
      const result = await mongo.distinct(NAME, {
        key: 'type',
      });
      assert.deepEqual(result, ['doc', 'text']);
    });

    it('should success with query', async () => {
      const result = await mongo.distinct(NAME, {
        key: 'type',
        query: { type: 'doc' },
      });
      assert(Array.isArray(result));
      assert.deepEqual(result, ['doc']);
    });

    it('should error', async () => {
      try {
        await mongo.distinct(NAME);
      } catch (error) {
        assert.equal(
          error.message,
          '"key" had the wrong type. Expected string, found null'
        );
      }
    });
  });

  describe('createIndex()', () => {
    it('should success', async () => {
      const result = await mongo.createIndex(NAME, {
        fieldOrSpec: { title: -1 },
      });
      assert.equal(result, 'title_-1');
    });

    it('should success', async () => {
      const result = await mongo.createIndex(NAME, {
        fieldOrSpec: 'title',
      });
      assert(result === 'title_1');
    });

    it('should error', async () => {
      try {
        await mongo.createIndex(NAME, { fieldOrSpec: {} });
      } catch (error) {
        assert.equal(error.message, 'Index keys cannot be empty.');
      }
    });

    it('should create index fail with empty args', async () => {
      try {
        await mongo.createIndex(NAME);
      } catch (error) {
        assert(error instanceof Error);
      }
    });
  });

  describe('createCollection() && listCollections()', () => {
    it('should create && list collection success', async () => {
      await mongo.createCollection({ name: 'create' });
      const result = await mongo.listCollections();
      assert.notEqual(result.indexOf('create'), -1);
    });

    it('should error', async () => {
      try {
        await mongo.createCollection();
      } catch (error) {
        assert.ok(error);
      }
    });
  });

  describe('aggregate()', () => {
    const docs = [
      { type: 'doc1' },
      { type: 'doc2' },
      { type: 'doc3' },
      { type: 'doc4' },
    ];
    beforeEach(async () => await mongo.insertMany(NAME, { docs }));

    it('should success', async () => {
      const pipeline = [
        { $match: {} },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ];
      const [result] = await mongo.aggregate(NAME, { pipeline });
      assert.equal(result.count, docs.length);
    });

    it('should error', async () => {
      try {
        await mongo.aggregate(NAME, { pipeline: {} });
      } catch (error) {
        assert.equal(error.name, 'MongoError');
      }
    });

    it('should error', async () => {
      try {
        await mongo.aggregate(NAME);
      } catch (error) {
        assert(error);
      }
    });
  });

  describe('startSession()', () => {
    it('should OK with MongoDB 3.6 above', () => {
      if (version < 3.6) return;

      const session = mongo.startSession();
      assert.equal(session.constructor.name, 'ClientSession');
    });

    it('should error with MongoDB under 3.6', () => {
      if (version >= 3.6) return;

      assert.throws(() => {
        try {
          mongo.startSession();
        } catch (error) {
          throw error;
        }
      }, Error);
    });
  });

  describe('startTransaction()', () => {
    it('should OK with MongoDB 4.0 above', () => {
      if (version < 4) return;

      const sess = mongo.startTransaction();
      assert.ok(sess.inTransaction());
    });

    it('should error with MongoDB under 4.0', () => {
      if (version >= 4) return;

      assert.throws(() => {
        try {
          mongo.startTransaction();
        } catch (error) {
          throw error;
        }
      }, Error);
    });
  });
});
