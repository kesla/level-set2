var test = require('tap').test
  , level = require('level-test')()

  , Set = require('./sets')()

test('getAll() when no data in db', function (t) {
  var set = Set(level('db1'))

  set.getAll('key', function (err, array) {
    t.deepEqual(array, [])
    t.end()
  })
})

test('getAll() when data in db', function (t) {
  var db = level('db2')
    , set = Set(db)

  db.put('key', JSON.stringify(['hello', 'world']), function () {
    set.getAll('key', function (err, array) {
      t.deepEqual(array, [ 'hello', 'world' ])
      t.end()
    })
  })
})

test('add()', function (t) {
  var db = level('db3')
    , set = Set(db)

  set.add('key', 'foo', function () {
    set.add('key', 'foo', function () {
      set.getAll('key', function (err, array) {
        t.deepEqual(array, ['foo'])
        db.get('key', function (err, data) {
          t.equal(data, '["foo"]')
          t.end()
        })
      })
    })
  })
})

test('add() and then remove() and then getAll()', function (t) {
  var db = level('db4')
    , set = Set(db)

  set.add('key', 'foo', function () {
    set.getAll('key', function (err, array) {
      t.deepEqual(array, ['foo'])
      set.remove('key', 'foo', function () {
        set.getAll('key', function (err, array) {
          t.deepEqual(array, [])
          db.get('key', function (err, data) {
            t.equal(err.notFound, true)
            t.end()
          })
        })
      })
    })
  })
})

test('concurrency when doing add()', function (t) {
  var db = level('db6')
    , set = Set(db)
    , count = 2
    , done = function () {
        count = count - 1

        if (count === 0)
          set.getAll('hello', function (err, array) {
            t.deepEqual(array.sort(), ['world', 'worldz'])
            t.end()
          })
      }

  set.add('hello', 'world', done)
  set.add('hello', 'worldz', done)
})

test('concurrency when doing remove()', function (t) {
  var db = level('db7')
    , set = Set(db)
    , count = 2
    , done = function () {
        count = count - 1

        if (count === 0)
          set.getAll('hello', function (err, array) {
            t.deepEqual(array.sort(), ['world'])
            t.end()
          })
      }

  set.add('hello', 'worldz', function () {
    set.remove('hello', 'worldz', done)
    set.add('hello', 'world', done)
  })
})