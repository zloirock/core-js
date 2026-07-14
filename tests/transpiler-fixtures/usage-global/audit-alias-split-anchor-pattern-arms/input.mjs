// the split-anchor pattern rejections drive usage-global INJECTION through the per-method
// statics channel (statics-only globals bundle nothing with their name): the outer alias
// injects only ITS static, the inner one injects only when its write soundly resolves - a
// mispaired / nested write leaves the inner method module OUT of the import set
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
// a CONDITIONALLY-written alias still might-injects: the taken path needs the polyfill and
// over-injection is the safe direction here
let CG;
if (cond) ({ Math: CG } = globalThis);
export const viaConditionalWrite = CG.hypot(dx, dy);
/* eslint-enable no-redeclare, vars-on-top -- end of split-anchor shapes */
export const results = [viaMispair, viaNested, viaSoundFlat, viaSoundWrap, viaConditionalWrite];
