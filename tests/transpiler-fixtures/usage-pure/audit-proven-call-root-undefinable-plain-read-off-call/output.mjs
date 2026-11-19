import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
const provenProbe = () => _globalThis.window;
// NEGATIVE: a PLAIN read off the probe-yielding call throws natively, and erasing that throw is the
// ordinary collapse - the guard question is only about a `?.` the emit would drop
export const plainReadOffCall = _self.Array?.prototype;