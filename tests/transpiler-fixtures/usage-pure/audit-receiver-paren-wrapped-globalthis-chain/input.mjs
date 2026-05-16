// `(globalThis?.X.Y).flat?.(0);` - receiver chain wrapped in outer parens. resolveReceiver-
// Source must peel transparent wrappers (Paren / Chain / TS) at the TOP of receiverObj
// before dispatching to direct-Identifier or chain resolvers; otherwise the Member-type
// gate rejects the Paren wrap and the proxy-global leaf falls through to a less precise
// substitution path, leaving raw `globalThis` in the emit (IE11 ReferenceError).
(globalThis?.X.Y).flat?.(0);
