var test = require('tap').test,

  level = require('level-test')()

  Set = require('./sets')

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