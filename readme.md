# level-set2[![build status](https://secure.travis-ci.org/kesla/level-set2.png)](http://travis-ci.org/kesla/level-set2)

Treat a value in level like a Set

## Installation

```
npm install level-set2
```

## Example

### Input

```javascript
var db = require('level-test')()('sets')

  set = require('./sets')(db)

set.put('key', 'value', function () {
  set.put('key', 'value', function () {
    set.get('key', function (err, array) {
      console.log('key', JSON.stringify(array, null, 4))
      set.get('bar', function (err, array) {
        console.log('empty array', JSON.stringify(array, null, 4))
      })
    })
  })
})
```

### Output

```
key [
    "value"
]
empty array []
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

