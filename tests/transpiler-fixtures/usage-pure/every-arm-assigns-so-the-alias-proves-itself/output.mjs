import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _self from "@core-js/pure/actual/self";
// When every arm assigns the realm, the alias permits a direct static fold.
// Mixed or missing arms and shadowed realm names provide only candidates: pure keeps
// the constructor read behind an identity guard. A later overwrite prevents direct
// folding too. Distinct static methods keep these decisions independently observable.
export function bothArmsName(flag) {
  if (flag) {
    var G = _globalThis;
  } else {
    var G = _self;
  }
  return _Array$from([2]);
}
export function bothArmsDestructure(flag) {
  if (flag) {
    var H = _globalThis;
  } else {
    var H = _self;
  }
  const entries = _Object$entries;
  return entries({
    a: 1
  });
}
// negatives
export function oneArmIsNotTheRealm(flag) {
  var _ref;
  if (flag) {
    var N = _globalThis;
  } else {
    var N = {};
  }
  return _ref = N.Array, _ref === Array ? _Array$of(3) : _ref.of(3);
}
export function noAlternate(flag) {
  var _ref2;
  if (flag) {
    var L = _globalThis;
  }
  return _ref2 = L.Object, _ref2 === Object ? _Object$assign({}, {
    b: 2
  }) : _ref2.assign({}, {
    b: 2
  });
}
export function armShadowsTheRealmName(flag) {
  if (flag) {
    const globalThis = {};
    var S = globalThis;
  } else {
    var S = _self;
  }
  return _Object$getOwnPropertyNames({
    c: 3
  });
}
export function writtenAgainAfterThePair(flag) {
  if (flag) {
    var W = _globalThis;
  } else {
    var W = _self;
  }
  if (flag) W = {};
  return W.Object.freeze({
    d: 4
  });
}