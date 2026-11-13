import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// Keep the source guard and distinguish realm values from user properties.
export const r = (flag ? globalThis : self).window?.Array.from([3]);