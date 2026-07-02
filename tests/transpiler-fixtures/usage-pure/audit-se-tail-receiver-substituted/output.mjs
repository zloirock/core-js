import _globalThis from "@core-js/pure/actual/global-this";
// SE-tail receiver `(0, globalThis).flat?.(0)`: a SequenceExpression whose tail is a
// polyfillable proxy-global Identifier. without SE-tail substitution the receiver text
// stays verbatim and the inner `globalThis -> _globalThis` rewrite is overwritten by the
// outer template, stranding raw `globalThis`. the SE tail must be peeled, the proxy-global
// resolved, and the receiver rebuilt preserving the SE wrapping.
(0, _globalThis).flat?.(0);