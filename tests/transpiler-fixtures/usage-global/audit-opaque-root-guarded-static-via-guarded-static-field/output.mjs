import "core-js/modules/es.string.repeat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.to-fixed";
const g = () => globalThis;
export const viaGuardedStaticField = g()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);