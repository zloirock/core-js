import "core-js/modules/es.global-this";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.number.epsilon";
import "core-js/modules/web.self";
export const claimsAcrossOperator = globalThis.window?.self.Math.trunc(1.5) + globalThis.window?.self.Number.EPSILON;