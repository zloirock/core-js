// a bare `Reflect` read takes the narrow namespace entry: standing alone as a statement it performs nothing and
// leaves, while a `typeof` read keeps it
Reflect;
export const kind = typeof Reflect;
