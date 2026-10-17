import "core-js/modules/es.global-this";
import "core-js/modules/es.number.parse-int";
import "core-js/modules/web.self";
let k8;
export const castAroundValue = (k8 = globalThis.self as any)?.Number.parseInt('7', 10);