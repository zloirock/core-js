import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// a static reached through an OPAQUE inline-call proxy-nav root under an OUTER instance
// dispatch: the guard keeps the raw root (its SE + short-circuit), and the resolved static
// pair earns its side-effect imports - call and FIELD spellings alike
const f = () => globalThis;
export const viaGuardedStaticCall = f()?.window?.Array.of(5).at(0);