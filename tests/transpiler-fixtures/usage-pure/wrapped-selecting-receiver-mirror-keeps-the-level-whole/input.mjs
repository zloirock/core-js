// Selecting wrapper routes retain the whole runtime level when spreads or later keys can affect it.
// Supported constructor branches are served; unknown alias and getter replacements stay native.
const [{ hasOwn: viaSpreadShift }] = [...[c ? Object : userObj]];
const [, { getOwnPropertyNames: viaSpreadAhead }] = [...[0], c ? Object : userObj];
const { w: { is: viaSpreadLevel } } = { w: c ? Object : userObj, ...more };
const { w: { freeze: viaLaterKey } } = { w: c ? Object : userObj, [k]: 1 };
const [{ isFrozen: viaSpreadAlias }] = [...wrapped];
const { w: { isSealed: viaGetterLast } } = { w: c ? Object : userObj, get w() { return userObj; } };
export { viaSpreadShift, viaSpreadAhead, viaSpreadLevel, viaLaterKey, viaSpreadAlias, viaGetterLast };
