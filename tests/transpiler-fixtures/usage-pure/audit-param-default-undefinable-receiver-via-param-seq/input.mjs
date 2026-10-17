// flat synth-swap, sequence-prefixed receiver (the prefix stays around the swap)
let e1 = 0;
export function viaParamSeq({ of } = (e1++, globalThis.window?.Array)) { return [of, e1]; }
