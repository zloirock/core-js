import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// probed-nav destructure forms (the pure flavor renders guards; global only injects) - lock
// the injection sets for the SE-key residual, assignment-host, alias-rooted, and anchored
// pattern-hop shapes
let c9 = 0;
export const {
  [(c9++, 'getOwnPropertyNames')]: viaProbeSeKeyResidual
} = globalThis.window?.self.Object;
export { c9 };