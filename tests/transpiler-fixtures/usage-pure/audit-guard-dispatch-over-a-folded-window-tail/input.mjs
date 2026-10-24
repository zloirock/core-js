// an instance dispatch whose receiver reads off a guarded tail past `self`: the probe read and the
// sequence effect stay ahead of the dispatched call, which takes the folded tail as its receiver.
// the emitters may differ on keeping the `window` hop past `self` there - the same realm object.
let rc = 0;
const rt = () => globalThis;
export const renderTailInstanceRecv = (rc++, rt()?.window?.self.window).Array.prototype.includes.call([5], 5);
export { rc };
