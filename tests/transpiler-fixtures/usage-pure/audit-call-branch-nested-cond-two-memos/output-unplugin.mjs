import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// NESTED conditional with TWO SE-bearing call branches and an unresolved key: each call leaf
// gets its OWN memoized function-IIFE param (numbered consistently), each branch literal carries
// that branch's polyfill, and the plain leaf keeps the mixed literal. only the taken branch's
// call runs, exactly once
let a = true;
let b = false;
let c = 0;
const { from, custom } = a ? (function (_ref) { return { from: _Array$from, custom: _ref.custom }; })((() => { c++; return Array; })()) : (b ? (function (_ref2) { return { from: _Iterator$from, custom: _ref2.custom }; })((() => { c++; return _Iterator; })()) : { from: _Array$from, custom: Array.custom });
from([1]);