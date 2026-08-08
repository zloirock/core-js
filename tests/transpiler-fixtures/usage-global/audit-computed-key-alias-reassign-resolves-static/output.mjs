import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// `Array[K]` where the key alias K is reassigned AFTER the use - at the call K is still 'from', so
// usage-global must inject es.array.from. the identifier-binding-follow gate that resolves the
// computed key is now method-aware (usage-global keeps following a non-dominating reassigned key).
let K = 'from';
Array[K]([1, 2, 3]);
K = 'of';