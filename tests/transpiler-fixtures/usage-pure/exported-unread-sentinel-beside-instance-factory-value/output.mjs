import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Directly exported pattern leaves are externally read, regardless of a sentinel-shaped name.
// A pure method or dispatcher beside them does not make their native read already processed.
import dispatch from '@core-js/pure/actual/instance/at';
import method from '@core-js/pure/actual/array/from';
import includes from '@core-js/pure/actual/array/instance/includes';
export const _unused = _atMaybeArray([]);
export const held = dispatch;
export const _unused2 = method;
export const heldStatic = method;
export const _unused3 = includes([]);
export const heldInstance = includes([]);