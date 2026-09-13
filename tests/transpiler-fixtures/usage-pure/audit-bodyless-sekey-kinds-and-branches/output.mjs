import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Bodyless var hosts retain each key effect and extraction inside the conditional body.
// Constructor, single-instance and multiple-instance forms preserve source evaluation order.

// global-ctor kind (vs static / instance): the extracted constructor binding registers a global alias and,
// in a bodyless if, joins the one `var` with the residual
if (c) var P = _Promise,
  {
    [(log(), 'Promise')]: _unused
  } = _globalThis;

// A preceding initializer and the computed instance extraction share one var body.
while (c) var first = init,
  _ref = rows,
  fm = null == _ref ? _ref[""] : (log(), _flatMapMaybeArray(_ref));

// Two instance keys retain their alternating key-effect and read order in one var body.
do var _ref2 = rows,
  _ref3 = _ref2,
  fl = null == _ref3 ? _ref3[""] : (log(), _findLastMaybeArray(_ref3)),
  _ref4 = _ref2,
  fli = null == _ref4 ? _ref4[""] : (log(), _findLastIndexMaybeArray(_ref4)); while (c);