import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// assignment-form hosts with collapsible fallback RHS: a pure logical / ternary RHS is
// discarded by the cascade entirely, a transparent IIFE keeps its call as a statement
// (one evaluation, exactly as native) - the binding always gets the polyfill
let from;
let of;
let c = true;
from = _Array$from;
(() => (c ? _globalThis : _self))();
of = _Array$of;
from([1]);
of(2);