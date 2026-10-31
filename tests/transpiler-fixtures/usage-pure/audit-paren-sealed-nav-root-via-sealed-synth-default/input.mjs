// the probe rides the PARAM-DEFAULT synth swap too: the sealed read re-emits ahead of the
// synth literal (throw before the default binds; the nav's key SE runs once, on the probe)
export function viaSealedSynthDefault({ getPrototypeOf: sp1 } = (globalThis.window?.self.window).Object) { return sp1; }
