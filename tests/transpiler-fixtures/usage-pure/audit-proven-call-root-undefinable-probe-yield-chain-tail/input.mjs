const provenProbe = () => globalThis.window;
export const probeYieldChainTail = provenProbe()?.self?.window.Array.of(1).at(0);
