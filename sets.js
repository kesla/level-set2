var Set2 = function (db) {
      if (!(this instanceof Set2))
        return new Set2(db)

      this.db = db
      this.getRange = require('level-get-range')(db)
  }

Set2.prototype.getAll = function (callback) {
  this.getRange({ values: false }, callback)
}

Set2.prototype.add = function (key, callback) {
  // currently levelup don't allow empty values
  // TODO: change when it does
  this.db.put(key, ' ', callback)
}

Set2.prototype.remove = function (key, callback) {
  this.db.del(key, callback)
}

module.exports = Set2
