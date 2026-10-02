import _at from "@core-js/pure/actual/instance/at";
// A throw in a nested function belongs to its call execution, outside the surrounding catch.
// Its thrown container escapes and keeps positional dispatch generic.
const rows = [[1, 2]];
try {
  function f() {
    throw rows;
  }
  use(f);
} catch (e) {}
const [_ref] = rows;
const at = _at(_ref);
use(at);