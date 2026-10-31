// a global wrapped in TS `satisfies`: the cast is peeled so the global reference is recognised and polyfilled -
// standing alone as a statement it performs nothing and leaves, while a `typeof` read keeps it
(Promise satisfies any);
export const kind = typeof (Promise satisfies any);
