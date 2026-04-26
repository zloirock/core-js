import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// array-destructure with default value: `a` falls back to `'fallback'` (a string),
// so `a.at(0)` could resolve to either string or array instance polyfill - test uses
// the generic instance form for safety.
const [a = 'fallback'] = [];
a.at(0);