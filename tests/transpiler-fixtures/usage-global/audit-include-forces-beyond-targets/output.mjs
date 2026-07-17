import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `include` (module-id form on global) FORCES injection beyond targets in every channel:
// statics, instance methods, constructors and the SYNTAX-driven iterator-protocol modules
// all inject although the targets support them natively
export const viaStatic = Array.from(items);
export const viaInstance = list.at(0);
export const viaConstructor = new Map(pairs);
for (const v of iterable) use(v);

// NEGATIVE control: a module NOT listed keeps the targets decision (natively supported -> none)
export const notIncluded = Object.groupBy(items, keyFn);