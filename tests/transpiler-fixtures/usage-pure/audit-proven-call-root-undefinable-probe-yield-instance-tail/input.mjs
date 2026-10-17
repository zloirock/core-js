globalThis.callRootBox = { list: [[1]] };
const provenProbe = () => globalThis.window;
export const probeYieldInstanceTail = provenProbe()?.self?.window.callRootBox.list?.at(0);
