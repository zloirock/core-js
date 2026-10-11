// a sequence with nothing to run around a call-rooted realm hop hands the hop's value on: a read or
// a call through it lands on the backed hop like the bare twin, and the dead prefix goes with the run
const realm = () => globalThis;
export const readThrough = (0, realm().self).readSlot;
export const calledThrough = (0, realm().self).callSlot();
