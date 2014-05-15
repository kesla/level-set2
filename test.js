var subLevel = require('level-sublevel')
  , test = require('tap').test

  , level = require('level-test')()

  , Set = require('./sets')

  , collect = function (stream, callback) {
      var array = []

      stream.on('data', function (chunk) {
        array.push(chunk)
      })
      stream.once('end', function () {
        callback(array)
      })
    }

test('getAll() when no data in db', function (t) {
  var set = Set(level('getAll-empty-db'))

  set.getAll(function (err, array) {
    t.deepEqual(array, [])
    t.end()
  })
})

test('getAll() when data in db', function (t) {
  var db = level('getAll-data-in-db')
    , set = Set(db)

  db.batch()
    .put('hello', ' ')
    .put('world', ' ')
    .write(function () {
      set.getAll(function (err, array) {
        t.deepEqual(array, [ 'hello', 'world' ])
        t.end()
      })
    })
})

test('add()', function (t) {
  var db = level('add')
    , set = Set(db)

  set.add('foo', function () {
    set.add('foo', function () {

      db.get('foo', function (err) {
        t.notOk(err)
        t.end()
      })
    })
  })
})

test('add() multiple', function (t) {
  var db = level('add-multiple', { encoding: 'json' })
    , set = Set(db)

  set.add(4, function () {
    set.add(2, function () {
      set.add(3, function () {
        set.add(1, function () {
          set.add(5, function () {
            set.getAll(function (err, array) {
              t.deepEqual(array, [1,2,3,4,5])
              t.end()
            })
          })
        })
      })
    })
  })
})

test('add() and then remove() and then getAll()', function (t) {
  var db = level('db4')
    , set = Set(db)

  set.add('foo', function () {
    set.getAll(function (err, array) {
      t.deepEqual(array, ['foo'])
      set.remove('foo', function () {
        set.getAll(function (err, array) {
          t.deepEqual(array, [])
          db.get('foo', function (err, data) {
            t.equal(err.notFound, true)
            t.end()
          })
        })
      })
    })
  })
})

test('concurrency when doing add()', function (t) {
  var db = level('add-concurrency')
    , set = Set(db)
    , count = 2
    , done = function () {
        count = count - 1

        if (count === 0)
          set.getAll(function (err, array) {
            t.deepEqual(array, ['hello', 'worldz'])
            t.end()
          })
      }

  set.add('worldz', done)
  set.add('hello', done)
})

test('concurrency when doing remove()', function (t) {
  var db = level('db7')
    , set = Set(db)
    , count = 2
    , done = function () {
        count = count - 1

        if (count === 0)
          set.getAll(function (err, array) {
            t.deepEqual(array.sort(), ['world'])
            t.end()
          })
      }

  set.add('worldz', function () {
    set.remove('worldz', done)
    set.add('world', done)
  })
})