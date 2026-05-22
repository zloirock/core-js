// IIFE-param wrapper around a fromFallback receiver: `(({from} = cond ? Array : Set) => ...)()`.
// without IIFE-param branch lift, per-branch enumeration sees only the AssignmentPattern
// default and misses the call-arg path. both branches must contribute their own polyfill
// so static-method dispatch fires for either runtime-chosen receiver
const result = (({from} = cond ? Array : Set) => from([1, 2]))();
result;
