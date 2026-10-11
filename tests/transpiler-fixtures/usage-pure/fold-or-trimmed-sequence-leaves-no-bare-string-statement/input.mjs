// a fold or a trimmed sequence never leaves a string alone as a whole statement, where it would read as a
// directive: a string fold that may not leave keeps a `0` ahead of it, a trimmed sequence the element ahead
// of its string value - the script and its function bodies stay sloppy
typeof Symbol == 'undefined' ? installSymbol() : 'ready';
'use strict';
module.exports = [function () {
  (globalThis.Set, 'use strict');
  return this;
}, function () {
  (typeof Map == 'undefined' && installMap(), 'use strict');
  return this;
}];
