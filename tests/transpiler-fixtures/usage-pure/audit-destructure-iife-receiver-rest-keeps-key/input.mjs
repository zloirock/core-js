// regression lock: an IIFE-returned receiver (side-effecting) with a `...rest` sibling preserves the
// IIFE (its effect runs) and keeps the consumed key as a sentinel so rest stays exclusion-correct
let log = [];
const { of, ...rest } = (() => { log.push(1); return Array; })();
of(2);
export { rest, log };
