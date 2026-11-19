// IIFE body has a leading `'use strict'` directive ExpressionStatement before the return.
// prefix ExpressionStatements are allowed; receiver resolves to Array for `.from`, and Set
// for `.intersection` so distinct lines pick distinct polyfills.
const fromArr = (() => { 'use strict'; return Array; })().from([1, 2]);
const intersect = (() => { 'use strict'; return Set; })().prototype.intersection;
export { fromArr, intersect };
