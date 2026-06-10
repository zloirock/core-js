// assignment-form hosts with collapsible fallback RHS: a pure logical / ternary RHS is
// discarded by the cascade entirely, a transparent IIFE keeps its call as a statement
// (one evaluation, exactly as native) - the binding always gets the polyfill
let from;
let of;
let c = true;
({ Array: { from } } = globalThis || self);
({ Array: { of } } = (() => (c ? globalThis : self))());
from([1]);
of(2);
