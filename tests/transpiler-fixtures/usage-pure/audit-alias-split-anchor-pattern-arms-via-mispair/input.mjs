// The duplicate-var SPLIT ANCHOR (`var O; var { Object: O } = g;`) judges the writing declarator with the SAME pattern rejections
// as the init arm: an array-wrap write judges only the POSITIONALLY-paired element and a NESTED binding rejects (it reads a
// different key path).
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
export const results = [viaMispair];
