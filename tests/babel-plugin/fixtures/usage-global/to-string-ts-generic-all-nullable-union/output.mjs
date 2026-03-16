import "core-js/modules/es.object.to-string";
import "core-js/modules/es.regexp.to-string";
declare function wrap<T>(x: T): T | null;
wrap(null).toString();