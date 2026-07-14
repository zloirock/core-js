// the duplicate-var SPLIT ANCHOR (`var O; var { Object: O } = g;`) judges the writing declarator
// with the SAME pattern rejections as the init arm: an array-wrap write judges only the
// POSITIONALLY-paired element and a NESTED binding rejects (it reads a different key path).
// statics-only globals (no whole-ctor pure entry) exercise the per-method channel: the outer
// alias uses a DIFFERENT static than the inner one, so each site's fold is its own evidence
/* eslint-disable no-redeclare, vars-on-top -- duplicate-var split anchor under test */

// mispaired array-wrap write: the inner binding pairs with the user element - stays native
function viaMispair(userObj, src) {
  const { Object: O } = globalThis;
  outerUse(O.keys(src));
  return function inner() {
    var O;
    var [x, { Object: O }] = [globalThis, userObj];
    return O.groupBy(src, tag);
  };
}

// nested-pattern write: reads `globalThis.constructor.Array`, not the global - stays native
function viaNested(items) {
  const { Array: A } = globalThis;
  outerUse(A.of(one, two));
  return function inner() {
    var A;
    var { constructor: { Array: A } } = globalThis;
    return A.fromAsync(items);
  };
}

// control: a FLAT sound anchor write folds the inner static through its own registration
function viaSoundFlat(values) {
  const { Math: M } = globalThis;
  outerUse(M.trunc(value));
  return function inner() {
    var M;
    var { Math: M } = globalThis;
    return M.sumPrecise(values);
  };
}

// control: a sound array-wrap anchor write (global in the PAIRED slot) folds too
function viaSoundWrap(text) {
  const { Number: N } = globalThis;
  outerUse(N.isInteger(candidate));
  return function inner() {
    var N;
    var [x, { Number: N }] = [userElem, globalThis];
    return N.parseFloat(text);
  };
}
// a DEAD slot default on the anchor write (paired element is the known global) judges the
// pair, not the default - the inner static still folds
function viaDeadDefaultAnchor(userObj, values) {
  const { Math: MD } = globalThis;
  outerUse(MD.f16round(x));
  return function inner() {
    var MD;
    var [q, { Math: MD } = fb] = [userObj, globalThis];
    return MD.sign(delta);
  };
}

// a mutated global SLOT declines the registration (the alias holds the user's replacement);
// a mutated STATIC keeps the member read native the same way
globalThis.JSON = fake;
function viaMutatedSlot(input) {
  const { JSON: J } = globalThis;
  outerUse(J.stringify(input));
  return function inner() {
    var J;
    var { JSON: J } = globalThis;
    return J.rawJSON(input);
  };
}
Reflect.ownKeys = shim;
function viaMutatedStatic(target) {
  const { Reflect: R } = globalThis;
  outerUse(R.get(target, propKey));
  return function inner() {
    var R;
    var { Reflect: R } = globalThis;
    return R.ownKeys(target);
  };
}
// the assignment-form arm registers statics-only hints the same way; a MULTI-NAME anchor
// write registers each bound name independently (per-name entries, no clobber)
let AS1;
({ Object: AS1 } = globalThis);
export const viaAssignStatics = AS1.entries(pairsSrc);
var MN1, MN2;
var { Object: MN1, Array: MN2 } = globalThis;
export const viaMultiNameFirst = MN1.getOwnPropertyNames(target2);
export const viaMultiNameSecond = MN2.from(iter);

// a later SLOT write of the hint's global deopts the whole name: the registration must not
// outlive it - both the alias member and the bare global stay verbatim
let SW;
({ String: SW } = globalThis);
String = shim;
export const viaHintSlotWrite = SW.raw(parts);
export const viaDeoptedBare = String.fromCodePoint(cp);
/* eslint-enable no-redeclare, vars-on-top -- end of split-anchor shapes */
export const results = [viaMispair, viaNested, viaSoundFlat, viaSoundWrap, viaDeadDefaultAnchor, viaMutatedSlot, viaMutatedStatic];
