import _Array$from from "@core-js/pure/actual/array/from";
var _ref;
// a STATIC SE-key in an assignment: it must NOT take a receiver overwrite (statics have none) - the
// instance overwrite path is gated on kind; a static keeps the SE key in place and binds the pure import
let f;
_ref = Array, null == _ref ? _ref[""] : (eff(), f = _Array$from), _ref;