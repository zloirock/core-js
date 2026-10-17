import "core-js/modules/es.global-this";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/web.self";
let k12;
export const nonNullOnResult = (k12 = globalThis.self)!.String.fromCodePoint(99);