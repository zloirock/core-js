// A throw in a nested function belongs to its call execution, outside the surrounding catch.
// Its thrown container escapes and keeps positional dispatch generic.
const rows = [[1, 2]];
try {
  function f() {
    throw rows;
  }
  use(f);
} catch (e) {}
const [{
  at
}] = rows;
use(at);
