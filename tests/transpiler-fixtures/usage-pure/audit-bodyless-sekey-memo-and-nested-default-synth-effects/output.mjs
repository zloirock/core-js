import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The computed key and the property getter run in source order inside an unbraced body.
const effects = [];
const source = {
  get at() {
    _pushMaybeArray(effects).call(effects, 'get');
    return () => 7;
  }
};
if (source) var {
  [(_pushMaybeArray(effects).call(effects, 'key'), 'at')]: at
} = source;
export const result = [at(), effects];