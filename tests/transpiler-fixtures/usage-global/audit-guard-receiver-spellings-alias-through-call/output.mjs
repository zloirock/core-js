import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
const aliasFactory = () => globalThis.self;
let k4;
export const aliasThroughCall = (k4 = aliasFactory())?.Reflect.ownKeys({
  b: 2
});