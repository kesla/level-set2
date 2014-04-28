var db = require('level-test')()('sets')

  set = require('./sets')(db)

set.put('key', 'value', function () {
  set.put('key', 'value', function () {
    set.get('key', function (err, array) {
      console.log('key', JSON.stringify(array, null, 4))
      set.get('bar', function (err, array) {
        console.log('empty array', JSON.stringify(array, null, 4))
      })
    })
  })
})