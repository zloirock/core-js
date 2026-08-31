// TS skins on an alias-held run are value-transparent to the throw probe: the erased read
// probes exactly like the bare spelling, whichever wrapper the init or the receiver wears
const heldProbe = globalThis.window;
export const { of: viaAsInit } = (heldProbe.Array as any);
export const { of: viaBangInit } = heldProbe!.Array;
export const viaAsReceiver = (heldProbe.Array as any).of(21);
export const viaBangReceiver = (heldProbe!.Array).of(22);
