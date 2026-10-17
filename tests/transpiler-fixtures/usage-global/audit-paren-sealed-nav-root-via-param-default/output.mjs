import "core-js/modules/es.string.repeat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/web.self";
// the same shape as a parameter default renders identically
export function viaParamDefault(x = globalThis.window?.self.window?.Number.MAX_SAFE_INTEGER.toFixed(2)) {
  return x;
}