import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Object$values from "@core-js/pure/actual/object/values";
// A retained assignment reuses its captured selecting receiver for both instance reads.
// A user-written alias with a similar name still needs a snapshot before getter effects.
let name, values;
const _ref2 = _globalThis.vv || Object;
name = _nameMaybeFunction(_ref2);
values = _ref2 === Object ? _Object$values : _values(_ref2);
let _ref = source;
const {
    other
  } = _ref,
  at = _at(_ref);
use(name, values, other, at);