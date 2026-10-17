import "core-js/modules/es.object.entries";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
const aliasSelf = globalThis.self;
let k2;
export const aliasOfPonyfilled = (k2 = aliasSelf)?.Object.entries({
  a: 1
});