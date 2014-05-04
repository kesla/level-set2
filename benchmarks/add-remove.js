var set = require('../sets')(require('level-sublevel')(require('level-test')()('benchmark')))
  , COUNT = 5000
  , input = (function () {
      var keys = []
        , i = COUNT

      while(i > 0) {
        keys.push((new Date(i)).toJSON())
        i = i - 1
      }

      return keys
    })()
  , add = function () {
      var count = COUNT
        , done = function () {
            count = count - 1
            if (count === 0) {
              console.timeEnd('add')
              getAll()
            }
          }

      console.time('add')
      input.forEach(function (key) {
        set.sublevel('beep').add('boop', key, done)
      })
    }
  , getAll = function () {
      var count = COUNT
        , done = function () {
            count = count - 1
            if (count === 0) {
              console.timeEnd('getAll')
              remove()
            }
          }

      console.time('getAll')
      input.forEach(function (key) {
        set.sublevel('beep').getAll('boop', done)
      })      
    }
  , remove = function() {
      var count = COUNT
        , done = function () {
            count = count - 1
            if (count === 0) {
              console.timeEnd('remove')
            }
          }

      console.time('remove')
      input.forEach(function (key) {
        set.sublevel('beep').remove('boop', key, done)
      })
    }

add()
console.time('total')

process.once('exit', function () {
  console.timeEnd('total')
})