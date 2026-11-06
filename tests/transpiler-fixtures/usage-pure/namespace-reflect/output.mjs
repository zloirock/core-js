import _Reflect from "@core-js/pure/actual/reflect/namespace";
// a bare `Reflect` read takes the narrow namespace entry: standing alone as a statement it performs nothing and
// leaves, while a `typeof` read keeps it

export const kind = typeof _Reflect;