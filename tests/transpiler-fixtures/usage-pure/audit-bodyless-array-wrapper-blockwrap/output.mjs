import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// an array-wrapper static extract (`[{ k: v }, tail] = [Ctor, ...]`) binds the polyfill as a statement BEFORE
// the surviving residual array destructure. in a bodyless control body the two statements must share a `{ }`
// block - a do-while body holding two bare statements is unparsable, and a while/if residual would otherwise
// escape the loop / guard. block-wrapped to match babel's bodyless-body auto-block

// bodyless do-while: two bare statements in the body would be unparsable without the block
do {
  var o = _Array$of;
  var [{
    of: _unused
  }, tail] = [Array, 0];
} while (c);

// bodyless while: a distinct static - the residual must stay inside the loop, not run once after it
while (c) {
  var g = _Array$from;
  var [{
    from: _unused2
  }, rest] = [Array, 1];
}