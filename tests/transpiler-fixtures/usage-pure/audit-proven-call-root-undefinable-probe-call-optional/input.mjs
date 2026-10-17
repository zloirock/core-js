globalThis.callRootBox = { list: [[1]] };
const provenProbe = () => globalThis.window;
// the `?.` sits directly over the call: it is the only guard the source has
export const probeCallOptional = provenProbe()?.self.callRootBox.list;
