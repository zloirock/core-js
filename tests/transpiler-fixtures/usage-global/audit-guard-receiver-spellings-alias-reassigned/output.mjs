import "core-js/modules/es.global-this";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/web.self";
let reassigned = globalThis.window;
reassigned = globalThis.self;
let k5;
export const aliasReassigned = (k5 = reassigned)?.Number.parseFloat('1.5');