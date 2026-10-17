// flat synth-swap, alias-held receiver
const heldCtor = globalThis.window?.Array;
export function viaParamAlias({ of } = heldCtor) { return of; }
