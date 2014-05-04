var db = require('level-sublevel')(require('level-test')()('sets'))

  , set = require('./sets')(db)

set.add('key', 'value', function () {
  set.add('key', 'value', function () {
    set.getAll('key', function (err, array) {
      console.log('key', JSON.stringify(array, null, 4))
      set.getAll('bar', function (err, array) {
        console.log('empty array', JSON.stringify(array, null, 4))
      })
    })
  })
})

// we've also got support for sublevels built in! This
// assumes that the db is set on sublevel

set.sublevel('boo').add('key', 'value2', function () {
  set.sublevel('boo').getAll('key', function (err, array) {
    console.log('array from sublevel', JSON.stringify(array, null, 4))
  })
})