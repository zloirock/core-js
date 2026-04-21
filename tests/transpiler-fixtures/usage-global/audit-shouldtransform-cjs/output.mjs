import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// usage-global entry-level: `Array.from` triggers `es.array.from` polyfill injection.
// Testing usage-global scanner + plugin options bridge (not usage-pure internals).
Array.from([1, 2]);
[].at(0);