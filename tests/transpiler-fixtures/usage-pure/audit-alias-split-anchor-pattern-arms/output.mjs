import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$f16round from "@core-js/pure/actual/math/f16round";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Reflect$get from "@core-js/pure/actual/reflect/get";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// the duplicate-var SPLIT ANCHOR (`var O; var { Object: O } = g;`) judges the writing declarator
// with the SAME pattern rejections as the init arm: an array-wrap write judges only the
// POSITIONALLY-paired element and a NESTED binding rejects (it reads a different key path).
// statics-only globals (no whole-ctor pure entry) exercise the per-method channel: the outer
// alias uses a DIFFERENT static than the inner one, so each site's fold is its own evidence
/* eslint-disable no-redeclare, vars-on-top -- duplicate-var split anchor under test */

// mispaired array-wrap write: the inner binding pairs with the user element - stays native
function viaMispair(userObj, src) {
  const {
    Object: O
  } = _globalThis;
  outerUse(_Object$keys(src));
  return function inner() {
    var O;
    var [x, {
      Object: O
    }] = [_globalThis, userObj];
    return O.groupBy(src, tag);
  };
}

// nested-pattern write: reads `globalThis.constructor.Array`, not the global - stays native
function viaNested(items) {
  const {
    Array: A
  } = _globalThis;
  outerUse(_Array$of(one, two));
  return function inner() {
    var A;
    var {
      constructor: {
        Array: A
      }
    } = _globalThis;
    return A.fromAsync(items);
  };
}

// control: a FLAT sound anchor write folds the inner static through its own registration
function viaSoundFlat(values) {
  const {
    Math: M
  } = _globalThis;
  outerUse(_Math$trunc(value));
  return function inner() {
    var M;
    var {
      Math: M
    } = _globalThis;
    return _Math$sumPrecise(values);
  };
}

// control: a sound array-wrap anchor write (global in the PAIRED slot) folds too
function viaSoundWrap(text) {
  const {
    Number: N
  } = _globalThis;
  outerUse(_Number$isInteger(candidate));
  return function inner() {
    var N;
    var [x, {
      Number: N
    }] = [userElem, _globalThis];
    return _Number$parseFloat(text);
  };
}
// a DEAD slot default on the anchor write (paired element is the known global) judges the
// pair, not the default - the inner static still folds
function viaDeadDefaultAnchor(userObj, values) {
  const {
    Math: MD
  } = _globalThis;
  outerUse(_Math$f16round(x));
  return function inner() {
    var MD;
    var [q, {
      Math: MD
    } = fb] = [userObj, _globalThis];
    return _Math$sign(delta);
  };
}

// a mutated global SLOT declines the registration (the alias holds the user's replacement);
// a mutated STATIC keeps the member read native the same way
_globalThis.JSON = fake;
function viaMutatedSlot(input) {
  const {
    JSON: J
  } = _globalThis;
  outerUse(J.stringify(input));
  return function inner() {
    var J;
    var {
      JSON: J
    } = _globalThis;
    return J.rawJSON(input);
  };
}
_Reflect.ownKeys = shim;
function viaMutatedStatic(target) {
  const R = _Reflect;
  outerUse(_Reflect$get(target, propKey));
  return function inner() {
    var R;
    var R = _Reflect;
    return R.ownKeys(target);
  };
}
// the assignment-form arm registers statics-only hints the same way; a MULTI-NAME anchor
// write registers each bound name independently (per-name entries, no clobber)
let AS1;
({
  Object: AS1
} = _globalThis);
export const viaAssignStatics = _Object$entries(pairsSrc);
var MN1, MN2;
var {
  Object: MN1,
  Array: MN2
} = _globalThis;
export const viaMultiNameFirst = _Object$getOwnPropertyNames(target2);
export const viaMultiNameSecond = _Array$from(iter);

// a later SLOT write of the hint's global deopts the whole name: the registration must not
// outlive it - both the alias member and the bare global stay verbatim
let SW;
({
  String: SW
} = _globalThis);
String = shim;
export const viaHintSlotWrite = SW.raw(parts);
export const viaDeoptedBare = String.fromCodePoint(cp);
/* eslint-enable no-redeclare, vars-on-top -- end of split-anchor shapes */
export const results = [viaMispair, viaNested, viaSoundFlat, viaSoundWrap, viaDeadDefaultAnchor, viaMutatedSlot, viaMutatedStatic];