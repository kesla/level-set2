var db = require('level-sublevel')(require('level-test')()('sets'))

  , set = require('./sets')(db)
  , sublevelSet = require('./sets')(db.sublevel('boo'))

set.add('value', function () {
  set.add('value', function () {
    set.getAll(function (err, array) {
      console.log('the value added', JSON.stringify(array, null, 4))

      // The "db" can also be a sublevel
      // we've also got support for sublevels built in! This
      // assumes that the db is set on sublevel
      sublevelSet.add('value2', function () {
        sublevelSet.getAll(function (err, array) {
          console.log('array from sublevel', JSON.stringify(array, null, 4))
        })
      })
    })
  })
})