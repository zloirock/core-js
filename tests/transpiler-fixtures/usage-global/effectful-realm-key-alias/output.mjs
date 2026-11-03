import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A realm alias behind an effectful prefix keeps its effectful hop native in pure.
const realm = globalThis;
export const value = (prefix(), realm)[key(), 'self'].Array.from([1]);