globalThis.callRootBox = { list: [[1]] };
const provenProbe = () => globalThis.window;
export const probeCallDispatch = provenProbe()?.self.callRootBox.list?.flat();
