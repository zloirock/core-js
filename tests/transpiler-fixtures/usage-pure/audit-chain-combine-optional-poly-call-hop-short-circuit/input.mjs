// member-optional method-call hop (`?.at()`) between an optional inner call (`flat?.()`) and a
// polyfilled outer call (`.includes`): a nullish `flat()` result must short-circuit the WHOLE
// chain to undefined, NOT invoke `.at` on it. the threaded receiver lifts a `null ==` guard so the
// optional hop's short-circuit survives the combine
arr.flat?.()?.at().includes(0);
