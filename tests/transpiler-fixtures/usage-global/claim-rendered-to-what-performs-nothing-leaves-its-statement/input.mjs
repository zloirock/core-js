// usage-global rewrites none of these statements: each loads the modules of what it reads, an `in` test the
// modules of its receiver
'from' in Array;
'groupBy' in Object;
'finally' in Promise.prototype;
globalThis.Set;
Map;
Promise.resolve;
('allSettled' in Promise, run());
globalThis.WeakMap.prototype;
'unknownKey' in Object;
0;
void 0;
if (ready) Reflect;
export const last = (run(), WeakSet);
export function strictFromHere() {
  globalThis.Iterator;
  'use strict';
  return this;
}
export function lastLeavesItsComment() {
  run();
  /* kept */ 'from' in Array;
}
