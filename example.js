var db = require('level-test')()('sets')

  set = require('./sets')()(db)

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