var clone = require('clone')

  , Sets = function (db) {
      if (!(this instanceof Sets))
        return new Sets(db)

      this.db = db
    }

Sets.prototype.put = function (key, value, callback) {
  var self = this

  this.get(key, function (err, array) {

    if (err) return callback(err)

    if (array.indexOf(value) !== -1) return callback()

    array.push(value)

    self.db.put(key, array, { valueEncoding: 'json' }, callback)
  })
}

Sets.prototype.get = function (key, callback) {
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

Sets.prototype.del = function (key,value, callback) {
  var self = this

  this.get(key, function (err, array) {
    if (err) return callback(err)

    if (array.indexOf(value) === -1) return callback()

    array.splice(array.indexOf(value), 1)

    if (array.length === 0)
      self.db.del(key, callback)
    else
      self.db.put(key, array, { valueEncoding: 'json' }, callback)
  })
}

Sets.prototype.createReadStream = function (opts) {
  opts = clone(opts) || {}

  opts.valueEncoding = 'json'

  return this.db.createReadStream(opts)
}

Sets.prototype.createValueStream = function (opts) {
  opts = clone(opts) || {}

  opts.valueEncoding = 'json'

  return this.db.createValueStream(opts)
}

Sets.prototype.createKeyStream = function (opts) {
  return this.db.createKeyStream(opts)
}

module.exports = Sets