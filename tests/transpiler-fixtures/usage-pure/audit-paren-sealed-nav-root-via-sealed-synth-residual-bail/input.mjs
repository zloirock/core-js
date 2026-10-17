// A custom sibling retains its source read beside the synthesized polyfilled property.
// An empty pattern keeps the guarded receiver because coercion can still throw.
export function viaSealedSynthResidualBail({ groupBy: sn1, customK: sn2 } = (globalThis.window?.self.window).Object) { return [sn1, sn2]; }
