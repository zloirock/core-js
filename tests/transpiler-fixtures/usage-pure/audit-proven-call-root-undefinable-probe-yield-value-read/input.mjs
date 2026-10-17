const provenProbe = () => globalThis.window;
export const probeYieldValueRead = provenProbe()?.self?.window.Array;
