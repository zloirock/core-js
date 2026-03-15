import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.bold";
import "core-js/modules/web.dom-collections.iterator";
declare const tuple: [string, ...string[]];
for (const item of tuple) item.bold();