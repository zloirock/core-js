// a multi-element array-wrap binds each ObjectPattern element to the init element at the SAME
// index: `A` reads `userObj.Set` (native, must NOT rewrite), `M` reads `globalThis.Map` (folds).
// resolving position-blindly (any element is a global) wrongly rewrote the user-object alias
const userObj = { Set: function () {} };
const [{ Set: A }, { Map: M }] = [userObj, globalThis];
export const viaGlobalElem = M.groupBy([], x => x);
