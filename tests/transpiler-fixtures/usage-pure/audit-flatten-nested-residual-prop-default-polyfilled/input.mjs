// a NESTED proxy flatten that is PARTIALLY consumed: `Array.from` is extracted to a binding, but the
// sibling `other` survives inside the rebuilt `Array: { ... }` text. its default carries polyfillable
// content (an instance `.at` call, a static `Promise.any` call) that the natural visitor must still
// rewrite - foldNestedPattern must register residual targets for the surviving inner children so the
// usage-pure polyfill-always-wins contract holds and no native API leaks to IE11. distinct methods
// (.at instance, Promise.any static) show each survivor's content is independently re-anchored. the
// `Object` line carries TWO survivors in one nested prop, exercising the running dst-offset across
// multiple rebuilt entries (the second survivor's residual target must clear the first's text length)
const { Array: { from, withAt = [1].at(0) } } = globalThis;
const { Promise: { resolve, withAny = Promise.any([2]) } } = globalThis;
const { Object: { fromEntries, twoA = [3].at(0), twoB = [4].flat() } } = globalThis;
from([5]); resolve(6); fromEntries([]); withAt; withAny; twoA; twoB;
