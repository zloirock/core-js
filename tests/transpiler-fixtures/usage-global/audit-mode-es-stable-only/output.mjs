import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
// `mode: 'es'` includes only stable ECMAScript surfaces, excludes web standards like
// queueMicrotask / structuredClone. URL would NOT polyfill in `mode: 'es'` even on
// IE11 targets where it's missing
const last = [1, 2, 3].at(-1);
const map = new Map([['k', 1]]);
console.log(last, map.get('k'));