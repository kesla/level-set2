var Sets = function (db) {
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

    self.db.put(key, JSON.stringify(array), callback)
  })
}

Sets.prototype.get = function (key, callback) {
  this.db.get(key, function (err, array) {
    if (err) {
      if (err.notFound){
        callback(null, [])
      } else{
        callback(err)
      }
    } else {
      callback(null, JSON.parse(array))
    }
  })
}

/*
, getAsArray = function (db, key, callback) {
    db.get(key, function (err, array) {
      if (err) {
        if (err.notFound){
          callback(null, [])
        } else{
          callback(err)
        }
      } else {
        callback(null, JSON.parse(array))
      }
    })
  }
, addToSet = function (db, key, value, callback) {
    getAsArray(db, key, function (err, array) {
      if (err)
        return callback(err)

      if (array.indexOf(value) !== -1)
        return callback()

      array.push(value)

      db.put(key, JSON.stringify(array), callback)
    })
  }
, removeFromSet = function (db, key, callback) {
    getAsArray(db, key, function (err, array) {
      if (err) return callback(err)
      if (array.indexOf(key) === -1) return callback()

      array = array.splice(array.indexOf(key), 1)

      db.put(key, JSON.stringify(array), callback)
    })
  }*/

module.exports = Sets