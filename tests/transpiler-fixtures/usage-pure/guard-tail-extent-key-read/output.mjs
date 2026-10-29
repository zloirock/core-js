import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A live guard below an effectful realm key remains responsible for the whole continuation.
// The nested claim in the key runs only after the environment probe succeeds.
export const read = () => null == _globalThis.window ? void 0 : _self[_Array$of(3)[0], 'window'].guardTailBox;