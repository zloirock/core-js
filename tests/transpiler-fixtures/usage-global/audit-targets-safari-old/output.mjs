import "core-js/modules/es.object.has-own";
import "core-js/modules/es.array.at";
// safari 12 lacks several ES2022+ surfaces (Array.at, hasOwn, structuredClone).
// targets resolution must include es.array.at + es.object.has-own polyfills here
// even though chrome/ie11 sets pull a different (overlapping) module set
const last = [1, 2, 3].at(-1);
const has = Object.hasOwn({}, 'k');
console.log(last, has);