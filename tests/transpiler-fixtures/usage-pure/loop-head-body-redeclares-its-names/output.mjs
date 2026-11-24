import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _values from "@core-js/pure/actual/instance/values";
// A separate body block keeps its lexical names out of head defaults and computed keys.
// Shadowed bindings may stay native while independently observed methods receive their polyfills.
for (const _ref of list) {
  const at = _at(_ref);
  const {
    flat
  } = _ref;
  {
    const flat = 1;
    use(at, flat);
  }
}
for (const {
  w: [{
    findLast
  }]
} of list) {
  let findLast = 2;
  use(findLast);
}
for (const _ref2 of list) {
  const {
      [key]: m
    } = _ref2,
    includes = _includes(_ref2);
  {
    let key = 3;
    use(m, includes);
  }
}
let target;
for (const _ref3 of list) {
  target = _entries(_ref3);
  {
    let target = 4;
    use(target);
  }
}
try {
  risky();
} catch (_ref4) {
  let _ref5,
    values = (_ref5 = _values(_ref4)) === void 0 ? fallback : _ref5;
  {
    let fallback = 5;
    use(values);
  }
}
for (const _ref6 of list) {
  const flatMap = _flatMapMaybeArray(_ref6);
  {
    let flatMap = 6;
    use(flatMap);
  }
  use(flatMap);
}