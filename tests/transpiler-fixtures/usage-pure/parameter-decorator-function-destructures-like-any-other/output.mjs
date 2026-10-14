import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// A parameter decorator's argument is walked apart from the main traversal, and a function inside it
// destructures as one anywhere else does: a declaration, an assignment, a default, a nested level, a nested
// function, an array wrapper declared and assigned, and a constructor rest each take the polyfill of the
// method or static they read, once.
const list = [1, 2];
export class Service {
  constructor(@Inject(() => {
    const includes = _includesMaybeArray(list);
    return includes;
  })
  a: unknown, @Inject(() => {
    let trunc;
    trunc = _Math$trunc;
    return trunc;
  })
  b: unknown, @Inject(() => {
    const of = _Array$of;
    return of;
  })
  c: unknown, @Inject(() => {
    const flat = _flatMaybeArray([1, [2]]);
    return flat;
  })
  d: unknown, @Inject(() => function () {
    const at = _atMaybeArray(list);
    return at;
  })
  e: unknown, @Inject(() => {
    const findLast = _findLastMaybeArray([3, 4]);
    return findLast;
  })
  f: unknown, @Inject(() => {
    var _ref;
    let last;
    [_ref] = [[5, 6]];
    last = _findLastIndexMaybeArray(_ref);
    return last;
  })
  g: unknown, @Inject(() => {
    const {
      groupBy,
      ...rest
    } = _Map;
    return [groupBy, rest];
  })
  h: unknown) {}
}