// A stored terminal realm probe keeps the value of its final window read.
// Parentheses, dead sequence elements and proven call roots do not turn that probe
// into a backed realm value. Prefix and computed-key effects run once in source order.
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";

let e = 0;
let stored;

function dh() {
	return _globalThis;
}

export const plain = stored = _self.window;
export const sealed = stored = _self.window;
export const deadSeq = stored = (0, _self).window;
export const callRoot = stored = _self.window;

// ... and the effect-carrying twins of the same four
export const prefixed = stored = (e++, _self).window;

export const callPrefixed = stored = (e++, _self).window;
export const seKeyed = stored = _self[(e++, "window")];
export { e, stored };