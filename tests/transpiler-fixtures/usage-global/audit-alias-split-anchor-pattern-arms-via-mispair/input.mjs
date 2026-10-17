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
export const results = [viaMispair];
