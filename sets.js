var encode = require('level-encode')
  , inherits = require('util').inherits
  , Lock = require('lock')

  , Sets = function (db, lock, child) {
      if (!(this instanceof Sets))
        return new Sets(db, lock, child)

      if (child) {
        this.db = db
        this.lock = lock
      } else {
        this.db = encode(db, 'json')
        this.lock = Lock()
      }
    }

Sets.prototype.add = function (key, value, callback) {
  var self = this

  this.lock(key, function (release) {
    callback = release(callback)

    self.getAll(key, function (err, array) {

      if (err) return callback(err)

      if (array.indexOf(value) !== -1) return callback()

      array.push(value)

      self.db.put(key, array, callback)
    })
  })
}

Sets.prototype.getAll = function (key, callback) {
  this.db.get(key, function (err, array) {
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

Sets.prototype.remove = function (key, value, callback) {
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
        self.db.put(key, array, callback)
    })
  })
}

Sets.prototype.sublevel = function (sub) {
  return new Sets(this.db.sublevel(sub), this.lock, true)
}

module.exports = Sets
