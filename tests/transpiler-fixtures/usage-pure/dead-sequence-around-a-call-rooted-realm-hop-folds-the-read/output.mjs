import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a sequence with nothing to run around a call-rooted realm hop hands the hop's value on: a read or
// a call through it lands on the backed hop like the bare twin, and the dead prefix goes with the run
const realm = () => _globalThis;
export const readThrough = _self.readSlot;
export const calledThrough = _self.callSlot();