import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// NEGATIVE: an OPTIONAL consumer of the sealed value performs no read - its short-circuit IS the
// guard's void-0 branch, so the test keys onto the probe under the seal
export const sealedOptionalConsumer = null == _globalThis.window ? void 0 : _Array$of;