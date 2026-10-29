import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A call-yield probe keeps its prefix before the guard and its key inside it.
// The same static import serves both emitters; the source call is evaluated once.
const read = () => globalThis.window;
(log.push('prefix'), read())?.self?.Array[log.push('key'), 'from']((log.push('argument'), [7]));