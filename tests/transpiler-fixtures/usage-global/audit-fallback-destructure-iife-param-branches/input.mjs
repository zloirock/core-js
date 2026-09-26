// IIFE-param wrapper around a conditional-fallback receiver:
// `(({ from } = cond ? Array : Set) => ...)()`. per-branch enumeration must reach the
// AssignmentPattern default's conditional, so both branches contribute their own polyfill
// and static-method dispatch fires for either runtime-chosen receiver. usage-global twin:
// instead of substituting bindings it injects side-effect imports for both branches' polyfills.
const result = (({ from } = cond ? Array : Set) => from([1, 2]))();
result;
