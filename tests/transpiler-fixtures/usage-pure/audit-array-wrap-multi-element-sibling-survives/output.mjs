import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
const from = _Array$from;
// an array wrapper of arity > 1 may be crossed on the walk to the destructure host, but the
// whole-declaration drop is the every-leaf-consumed case only: an unconsumed sibling keeps the
// declaration alive, with the consumed leaf renamed to a sentinel - unless its hop names a ctor the
// targets may lack (`Map`), whose sentinel would read that ctor off the realm: that leaf leaves with
// its hop, and the emptied last element sheds
const [{
  Array: {
    from: _unused
  }
}, other] = [_globalThis, 1];
const groupBy = _Map$groupBy;
const [second] = [2, _globalThis];
console.log(other, second, from, groupBy);