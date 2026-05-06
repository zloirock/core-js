// Paren-wrapped optional member with TS-expr wrapper (`as any`) between paren and the
// member. Two outer-call shapes probe the lookup-only gating:
//   ((arr?.at) as any)?.(0)   - optional outer call -> standard buildMethodCall path
//                               emits `arr == null ? void 0 : _at(arr)?.call(arr, 0)`
//                               (short-circuits cleanly on nullish, preserves `this`)
//   ((arr?.includes) as any)(1) - non-optional outer -> parenLookupOnly branch fires,
//                                 emits `(arr == null ? void 0 : _includes(arr)).call(arr, 1)`
//                                 so nullish throws via `.call` access AND success preserves `this`
declare const arr: number[];
((arr?.at) as any)?.(0);
((arr?.includes) as any)(1);
