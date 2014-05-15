# level-set2[![build status](https://secure.travis-ci.org/kesla/level-set2.png)](http://travis-ci.org/kesla/level-set2)

Treat a value in level like a Set

[![NPM](https://nodei.co/npm/level-set2.png?downloads&stars)](https://nodei.co/npm/level-set2/)

[![NPM](https://nodei.co/npm-dl/level-set2.png)](https://nodei.co/npm/level-set2/)

## Installation

```
npm install level-set2
```

## Example

### Input

```javascript
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
```

### Output

```
the value added [
    "value"
]
array from sublevel [
    "value2"
]
```

## Licence

Copyright (c) 2014 David Björklund

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

