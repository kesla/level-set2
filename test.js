var test = require('tap').test
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

test('get key not in db', function (t) {
  var set = Set(level('db1'))

  set.get('key', function (err, array) {
    t.deepEqual(array, []);
    t.end()
  })
})

test('get key in db', function (t) {
  var db = level('db2')
    , set = Set(db)

  db.put('key', JSON.stringify(['hello', 'world']), function () {
    set.get('key', function (err, array) {
      t.deepEqual(array, [ 'hello', 'world' ])
      t.end()
    })
  })
})

test('put key in db', function (t) {
  var db = level('db3')
    , set = Set(db)

  set.put('key', 'foo', function () {
    set.put('key', 'foo', function () {
      set.get('key', function (err, array) {
        t.deepEqual(array, ['foo'])
        db.get('key', function (err, data) {
          t.equal(data, '["foo"]')
          t.end()
        })
      })
    })
  })
})

test('put and then del and then get', function (t) {
  var db = level('db4')
    , set = Set(db)

  set.put('key', 'foo', function () {
    set.del('key', 'foo', function () {
      set.get('key', function (err, array) {
        t.deepEqual(array, [])
        db.get('key', function (err, data) {
          t.equal(err.notFound, true)
          t.end()
        })
      })
    })
  })
})

test('stream', function (t) {
  var db = level('db5')
    , set = Set(db)

  db.put('foo', JSON.stringify([1,2,3]), function () {
    db.put('bar', JSON.stringify(['beep', 'boop']), function () {
      collect(set.createReadStream(), function (array) {
        t.deepEqual(
            array
          , [
              {
                  key: 'bar'
                , value: ['beep', 'boop']
              }
            , {
                  key: 'foo'
                , value: [1, 2, 3]
              }
            ]
        )

        collect(set.createValueStream(), function (array) {
          t.deepEqual(
              array
            , [
                  ['beep', 'boop']
                , [1, 2, 3]
              ]
          )

          collect(set.createKeyStream(), function (array) {
            t.deepEqual(
                array
              , ['bar', 'foo']
            )
            t.end()
          })
        })
      })
    })
  })
})