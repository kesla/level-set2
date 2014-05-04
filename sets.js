var encode = require('level-encode')
  , AsyncCache = require('async-cache')

  , Sets = function (db, cache, child) {
      if (!(this instanceof Sets))
        return new Sets(db, cache, child)

      var self = this

      this._children = {}

      if (child) {
        this.db = db
        this.cache = cache
      } else {
        this.db = encode(db, 'json')
        this.cache = AsyncCache({
          load: function (prefixedKey, callback) {
            self.db.get(prefixedKey, function (err, array) {
              if (err && err.notFound)
                callback(null, [])
              else if (err)
                callback(err)
              else
                callback(null, array)
            })
          }
        })
      }
    }

Sets.prototype.add = function (key, value, callback) {
  var self = this

  this.cache.get(this.prefix(key), function (err, array) {
    if (err) return callback(err)

    if (array.indexOf(value) !== -1) return callback()

    array.push(value)

    self.db.put(key, array, callback)
  })
}

Sets.prototype.getAll = function (key, callback) {
  this.cache.get(this.prefix(key), function (err, array) {
    if (err)
      callback(err)
    else
      callback(null, array.slice(0))
  })
}

Sets.prototype.remove = function (key, value, callback) {
  var self = this

  this.cache.get(this.prefix(key), function (err, array) {
    if (err) return callback(err)

    if (array.indexOf(value) === -1) return callback()

    array.splice(array.indexOf(value), 1)

    if (array.length === 0)
      self.db.del(key, callback)
    else
      self.db.put(key, array, callback)
  })
}

Sets.prototype.prefix = function (key) {
  return this.db.db.prefix ? this.db.db.prefix(key) : key
}

Sets.prototype.sublevel = function (sub) {
  this._children[sub] = this._children[sub] || new Sets(this.db.sublevel(sub), this.cache, true)

  return this._children[sub]
}

module.exports = Sets
