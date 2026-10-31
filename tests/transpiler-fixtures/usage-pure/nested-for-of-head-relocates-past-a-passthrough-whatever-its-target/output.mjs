import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A for-of head's static under an effectful key, ahead of a key the mirror's literal reads natively, would
// have that literal read the key before the effect, so the head relocates into the body and the static is
// served there. An unclaimed key and an instance claim are read natively alike, and the slot's target does
// not matter: a computed member and a member rooted in a call relocate like a binding, at every level.
const o = {};
let f;
for (const _ref2 of [{
  w: Array
}]) {
  var _ref;
  ({
    w: _ref
  } = _ref2);
  ({} = _ref), e(), f = _Array$from, {
    length: o[k]
  } = _ref;
  use(f);
}
for (const _ref4 of [{
  w: {
    v: Array
  }
}]) {
  var _ref3;
  ({
    w: {
      v: _ref3
    }
  } = _ref4);
  ({} = _ref3), e(), f = _Array$of, {
    length: g().p
  } = _ref3;
  use(f);
}
for (const _ref6 of [[{
  w: Array
}]]) {
  var _ref5, _ref7;
  [_ref5] = _ref6, {
    w: _ref7
  } = _ref5, {} = _ref7, e(), f = _Array$fromAsync, o[k] = _nameMaybeFunction(_ref7);
  use(f);
}