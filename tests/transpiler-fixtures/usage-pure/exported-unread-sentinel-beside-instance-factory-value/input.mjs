// Directly exported pattern leaves are externally read, regardless of a sentinel-shaped name.
// A pure method or dispatcher beside them does not make their native read already processed.
import dispatch from '@core-js/pure/actual/instance/at';
import method from '@core-js/pure/actual/array/from';
import includes from '@core-js/pure/actual/array/instance/includes';

export const { at: _unused } = [];
export const held = dispatch;
export const { from: _unused2 } = Array;
export const heldStatic = method;
export const { includes: _unused3 } = [];
export const heldInstance = includes([]);
