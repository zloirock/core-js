import _Promise from "@core-js/pure/actual/promise/constructor";
// optional access on a parenthesised object expression `(obj)?.method`: the parens must be peeled for the rewrite
// to recognise the receiver - standing alone as a statement the read performs nothing and leaves, while a `typeof`
// read keeps it

export const kind = typeof _Promise;