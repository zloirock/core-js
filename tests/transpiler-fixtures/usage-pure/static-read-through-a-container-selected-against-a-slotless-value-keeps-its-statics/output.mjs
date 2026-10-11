import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _URL from "@core-js/pure/actual/url";
// a selection of a container and a value with no slot - nullish, a primitive, an `&&`'s falsy left - reads a
// static off the container wherever the read does not throw, so the constructor the container holds keeps its
// statics, whether the read stands on the selection, a pattern over it, an alias of its slot or a nested slot
const nul = flag ? {
  C: _Map
} : null;
export const grouped = nul.C.groupBy([1], x => x);
const anded = flag && {
  P: _Promise
};
export const settled = anded.P.allSettled([]);
const {
  S
} = flag ? {
  S: _Symbol
} : 0;
export const registered = (S === _Symbol ? _Symbol$for : S.for.bind(S))('a');
const empty = flag ? {
  I: _Iterator
} : '';
const I = empty.I;
export const copied = I.from([1]);
const nested = flag ? {
  w: {
    U: _URL
  }
} : false;
export const valid = nested.w.U.canParse('a:b');