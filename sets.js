var clone = require('clone')

  , Sets = function (db, lock) {
      if (!(this instanceof Sets))
        return new Sets(db)

      this.db = db
      this.lock = lock
    }

Sets.prototype.add = function (key, value, callback) {
  var self = this

  this.lock(key, function (release) {
    callback = release(callback)

    self.getAll(key, function (err, array) {

      if (err) return callback(err)

      if (array.indexOf(value) !== -1) return callback()

      array.push(value)

      self.db.put(key, array, { valueEncoding: 'json' }, callback)
    })
  })
}

Sets.prototype.getAll = function (key, callback) {
  this.db.get(key, { valueEncoding: 'json' }, function (err, array) {
    if (err) {
      if (err.notFound){
        callback(null, [])
      } else{
        callback(err)
      }
    } else {
      callback(null, array)
    }
  })
}

Sets.prototype.remove = function (key,value, callback) {
  var self = this

  this.lock(key, function (release) {
    callback = release(callback)

    self.getAll(key, function (err, array) {
      if (err) return callback(err)

      if (array.indexOf(value) === -1) return callback()

      array.splice(array.indexOf(value), 1)

      if (array.length === 0)
        self.db.del(key, callback)
      else
        self.db.put(key, array, { valueEncoding: 'json' }, callback)
    })
  })
}

module.exports = function () {
  var lock = require('lock')()

  return function (db) {
    return new Sets(db, lock)
  }
}