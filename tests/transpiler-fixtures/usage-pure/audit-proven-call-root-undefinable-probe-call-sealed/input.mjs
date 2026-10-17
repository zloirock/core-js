globalThis.callRootBox = { list: [[1]] };
const provenProbe = () => globalThis.window;
export const probeCallSealed = (provenProbe()?.self).callRootBox;
