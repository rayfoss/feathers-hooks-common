
const { assert } = require('chai');
const { alterItems } = require('../../lib/services');

let hookBefore;
let hookAfter;
let hookFindPaginate;
let hookFind;

describe('services alterItems', () => {
  beforeEach(() => {
    hookBefore = {
      type: 'before',
      method: 'create',
      params: { provider: 'rest' },
      data: { first: 'John', last: 'Doe' }
    };
    hookAfter = {
      type: 'after',
      method: 'create',
      params: { provider: 'rest' },
      result: { first: 'Jane', last: 'Doe' }
    };
    hookFindPaginate = {
      type: 'after',
      method: 'find',
      params: { provider: 'rest' },
      result: {
        total: 2,
        data: [
          { first: 'John', last: 'Doe' },
          { first: 'Jane', last: 'Doe' }
        ]
      }
    };
    hookFind = {
      type: 'after',
      method: 'find',
      params: { provider: 'rest' },
      result: [
        { first: 'John', last: 'Doe' },
        { first: 'Jane', last: 'Doe' }
      ]
    };
  });

  it('default func is a no-op', () => {
    return alterItems()(hookBefore).then(() => {
      assert.deepEqual(hookBefore.data, { first: 'John', last: 'Doe' });
    });
  });

  it('context is 2nd param', () => {
    let contextParam;
    return alterItems((rec, context) => { contextParam = context; })(hookBefore).then(() => {
      assert.deepEqual(contextParam, hookBefore);
    });
  });

  it('throws if 1st param is not a func', () => {
    try {
      alterItems('no-func');
    } catch (error) {
      assert.equal(error.message, 'Function required. (alter)');
      return;
    }
    throw new Error('alterItems does not throw an error if 1st param is not a function');
  });

  it('returns a promise that contains context', () => {
    return alterItems(rec => { rec.state = 'UT'; })(hookBefore).then(context => {
      assert.deepEqual(context, hookBefore);
    });
  });

  it('updates hook before::create', () => {
    return alterItems(rec => { rec.state = 'UT'; })(hookBefore).then(() => {
      assert.deepEqual(hookBefore.data, { first: 'John', last: 'Doe', state: 'UT' });
    });
  });

  it('updates hook before::create with new item returned', () => {
    return alterItems(rec => Object.assign({}, rec, { state: 'UT' }))(hookBefore).then(() => {
      assert.deepEqual(hookBefore.data, { first: 'John', last: 'Doe', state: 'UT' });
    });
  });

  it('updates hook before::create async', () => {
    const alterFunc = rec => {
      return new Promise(resolve => {
        rec.state = 'UT';
        resolve();
      });
    };
    return alterItems(alterFunc)(hookBefore).then(() => {
      assert.deepEqual(hookBefore.data, { first: 'John', last: 'Doe', state: 'UT' });
    });
  });

  it('updates hook before::create async with new item returned', () => {
    const alterFunc = rec => {
      return Promise.resolve(Object.assign({}, rec, { state: 'UT' }));
    };
    return alterItems(alterFunc)(hookBefore).then(() => {
      assert.deepEqual(hookBefore.data, { first: 'John', last: 'Doe', state: 'UT' });
    });
  });

  it('updates hook after::create', () => {
    return alterItems(rec => { rec.new = rec.first; })(hookAfter).then(() => {
      assert.deepEqual(hookAfter.result, { first: 'Jane', last: 'Doe', new: 'Jane' });
    });
  });

  it('updates hook after::create with new item returned', () => {
    return alterItems(rec => Object.assign({}, rec, { new: rec.first }))(hookAfter).then(() => {
      assert.deepEqual(hookAfter.result, { first: 'Jane', last: 'Doe', new: 'Jane' });
    });
  });

  it('updates hook after::find with pagination', () => {
    return alterItems(rec => { delete rec.last; })(hookFindPaginate).then(() => {
      assert.deepEqual(hookFindPaginate.result.data, [
        { first: 'John' },
        { first: 'Jane' }
      ]);
    });
  });

  it('updates hook after::find with no pagination', () => {
    return alterItems(rec => { rec.new = rec.first; })(hookFind).then(() => {
      assert.deepEqual(hookFind.result, [
        { first: 'John', last: 'Doe', new: 'John' },
        { first: 'Jane', last: 'Doe', new: 'Jane' }
      ]);
    });
  });

  it('updates hook after::find with pagination with new item returned', () => {
    return alterItems(rec => Object.assign({}, { first: rec.first }))(hookFindPaginate).then(() => {
      assert.deepEqual(hookFindPaginate.result.data, [
        { first: 'John' },
        { first: 'Jane' }
      ]);
    });
  });

  it('updates hook after::find with no pagination with new item returned', () => {
    return alterItems(rec => Object.assign({}, rec, { new: rec.first }))(hookFind).then(() => {
      assert.deepEqual(hookFind.result, [
        { first: 'John', last: 'Doe', new: 'John' },
        { first: 'Jane', last: 'Doe', new: 'Jane' }
      ]);
    });
  });
});
