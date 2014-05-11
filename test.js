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

test('getAll() returns same data every time', function (t) {
  var db = level('getAll-same-data')
    , set = Set(db)

  db.put('key', JSON.stringify(['hello', 'world']), function () {
    set.getAll('key', function (err, array) {
      array.push('beep')
      array.push('boop')
      set.getAll('key', function (err, array) {
        t.deepEqual(array, [ 'hello', 'world' ])
        t.end()
      })
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

test('add() multiple', function (t) {
  var db = level('add-multiple')
    , set = Set(db)

  set.add('key', 4, function () {
    set.add('key', 2, function () {
      set.add('key', 3, function () {
        set.add('key', 1, function () {
          set.add('key', 5, function () {
            db.get('key', function (err, data) {
              set.getAll('key', function (err, array) {
                t.deepEqual(array, [1,2,3,4,5])
                t.end()
              })
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

test('sublevel', function (t) {
  var db = subLevel(level('sublevel'))
    , set = Set(db)
    , count = 2
    , done = function () {
        count = count - 1

        if (count === 0)
          set.sublevel('foo').getAll('hello', function (err, array) {
            t.deepEqual(array.sort(), ['world'])
            t.end()
          })
      }

  set.sublevel('foo').add('hello', 'worldz', function () {
    set.sublevel('foo').remove('hello', 'worldz', done)
    set.sublevel('foo').add('hello', 'world', done)
  })
})

test('same key on main db as in sublevel', function (t) {
  var db = subLevel(level('sublevel-same-key'))
    , set = Set(db)
    , count = 6
    , done = function () {
        count = count - 1

        if (count === 0)
          // use new set-instances to avoid the cache
          Set(db).getAll('hello', function (err, array) {
            t.deepEqual(array.sort(), ['world'])
            Set(db).sublevel('foo').getAll('hello', function (err, array) {
              t.deepEqual(array, ['world2'])
              Set(db).sublevel('foo').sublevel('bar').getAll('hello', function (err, array) {
                t.deepEqual(array, ['world3'])
                // check that the cache works as expected also
                set.sublevel('foo').sublevel('bar').getAll('hello', function (err, array) {
                  t.deepEqual(array, ['world3'])
                  t.end()
                })
              })
            })
          })
      }

  set.add('hello', 'worldz', function () {
    set.remove('hello', 'worldz', done)
    set.add('hello', 'world', done)
  })

  set.sublevel('foo').add('hello', 'worldz2', function () {
    set.sublevel('foo').remove('hello', 'worldz2', done)
    set.sublevel('foo').add('hello', 'world2', done)
  })

  set.sublevel('foo').sublevel('bar').add('hello', 'worldz3', function () {
    set.sublevel('foo').sublevel('bar').remove('hello', 'worldz3', done)
    set.sublevel('foo').sublevel('bar').add('hello', 'world3', done)
  })
})

test('streams', function (t) {
  var db = level('streams')
    , set = Set(db)

  t.plan(3)

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
      })
      collect(set.createValueStream(), function (array) {
        t.deepEqual(
            array
          , [
                ['beep', 'boop']
              , [1, 2, 3]
            ]
        )
      })
      collect(set.createKeyStream(), function (array) {
        t.deepEqual(
            array
          , ['bar', 'foo']
        )
      })
    })
  })
})