import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.trunc";
import "core-js/modules/web.self";
export const claimInsideArgument = globalThis.window?.self.Array.of(globalThis.window?.self.Math.trunc(1.5));