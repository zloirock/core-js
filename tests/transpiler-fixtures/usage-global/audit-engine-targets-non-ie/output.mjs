import "core-js/modules/es.array.at";
// non-IE engine matrix: targets are constrained by chrome/firefox versions, not legacy
// IE. compat-data filtering resolves only modules missing in the listed engine versions.
// `Array.prototype.at` is unavailable in chrome 90 / firefox 88 - it polyfills;
// `Object.fromEntries` is supported in both - it does not polyfill
const arr = [1, 2, 3];
arr.at(-1);
Object.fromEntries([['a', 1]]);