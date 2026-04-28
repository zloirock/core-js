import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.string.at";
import "core-js/modules/web.dom-collections.entries";
// JSON-module import with `with { type: 'json' }` attribute, then downstream usage
// of a polyfillable method on the imported value. The attribute itself doesn't trigger
// any polyfill but the access on `data` must still be detected
import data from './data.json' with { type: 'json' };
data.entries.at(-1);