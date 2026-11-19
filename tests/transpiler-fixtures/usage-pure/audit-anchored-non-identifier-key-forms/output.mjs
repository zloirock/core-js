import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Constructor anchors require a known built-in name. Other keys retain their identity:
// real symbols remain symbolic, and instance extraction uses brackets for punctuated strings.
const iterName = _nameMaybeFunction(_getIteratorMethod(_globalThis));
const {
  'App-Key': {
    assign
  }
} = _globalThis;
const flat = _flatMaybeArray((null == _globalThis.window ? void 0 : _self)["A.b"]); // an identifier-valid capitalised key (`$` and the Unicode continue classes are identifier
// characters) names no built-in either: a user global is an unknown realm slot and stays nested
const {
  A$b: {
    from
  }
} = _globalThis;
const {
  Abé: {
    token
  }
} = _globalThis;
const {
  Map: {
    groupBy
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
// the binding host decides the route as much as the key does: an assignment reaches the same anchor
// render as the declaration, while a parameter default goes through the synth-swap mirror and never
// spelled the key after a dot in the first place
let union;
({
  'App-Key': {
    union
  }
} = _globalThis);
function reader({
  [_Symbol$iterator]: {
    keys
  }
} = _globalThis) {
  return keys;
}
console.log(iterName, assign, flat, from, token, groupBy, union, reader());