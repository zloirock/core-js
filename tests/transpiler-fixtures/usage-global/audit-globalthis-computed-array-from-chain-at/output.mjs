import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// computed-key proxy global: `globalThis['Array']` resolves to the Array constructor, so the
// `.from(...)` return-type narrows the chained `.at(-1)` to Array-only (not the ambiguous
// Array|String `.at` that would also pull es.string.at)
globalThis["Array"].from(x).at(-1);