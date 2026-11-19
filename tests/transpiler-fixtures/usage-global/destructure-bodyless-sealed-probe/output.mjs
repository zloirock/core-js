import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// The bodyless declaration keeps the sealed receiver's throw before extracting from.
if (enabled) var {
  from
} = (globalThis.window?.self).Array;
use(from);