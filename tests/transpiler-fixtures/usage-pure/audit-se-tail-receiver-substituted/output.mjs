import _globalThis from "@core-js/pure/actual/global-this";
// SE-tail receiver: `(0, globalThis).flat?.(0)` - receiver is a SequenceExpression
// whose tail is a polyfillable proxy-global Identifier. without the SE-tail substitution
// in `resolveReceiverSource`, the receiver text stayed verbatim and the inner Identifier
// visitor's `globalThis -> _globalThis` substitution was overwritten by the outer
// template, stranding raw `globalThis` in the emit. fix peels the SE tail, resolves the
// proxy-global, and rebuilds the receiver src preserving the SE wrapping
(0, _globalThis).flat?.(0);