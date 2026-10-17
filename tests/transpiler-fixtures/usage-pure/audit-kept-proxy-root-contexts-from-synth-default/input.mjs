// a param-default synth twin without a SE key: the wrapper default stays the synth target
export const fromSynthDefault = (({ from } = (globalThis.window ?? { from: x => [x] })) => from)([1]);
