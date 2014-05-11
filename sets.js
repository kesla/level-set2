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

    var min = 0
      , max = array.length - 1
      , ptr = 0

    if (array[min] === undefined || value > array[max]) {
      array.push(value)
      self.db.put(key, array, callback)
    } else if (value < array[min]) {
      array.unshift(value)
      self.db.put(key, array, callback)
    } else{
      while(max - min > 1) {
        ptr = Math.floor((max + min) / 2) 

        if (array[ptr] > value)
          max = ptr
        else
          min = ptr
      }

      if (array[ptr] === value) {
        callback()
      } else {
        array.splice(ptr + 1, 0, value)
        self.db.put(key, array, callback)
      }
    }
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

    var min = 0
      , max = array.length - 1
      , ptr = 0

    if (array[min] === undefined || value > array[max]) {
      callback()
    } else if (value < array[min]) {
      callback()
    } else{
      while(max - min > 1) {
        ptr = Math.floor((max + min) / 2) 

        if (array[ptr] > value)
          max = ptr
        else
          min = ptr
      }

      if (array[ptr] !== value) {
        callback()
      } else {
        array.splice(ptr, 1)
        if (array.length === 0)
          self.db.del(key, callback)
        else
          self.db.put(key, array, callback)
      }
    }
  })
}

Sets.prototype.prefix = function (key) {
  return this.db.db.prefix ? this.db.db.prefix(key) : key
}

Sets.prototype.sublevel = function (sub) {
  this._children[sub] = this._children[sub] || new Sets(this.db.sublevel(sub), this.cache, true)

  return this._children[sub]
};

['createReadStream', 'createValueStream', 'createKeyStream'].forEach(function (key) {
  Sets.prototype[key] = function (opts) {
    return this.db[key](opts)
  }
})

module.exports = Sets
