import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// IIFE body has a leading `'use strict'` directive ExpressionStatement before the return.
// `singleReturnBodyExpression` allows prefix ExpressionStatements; receiver resolves to Array
// for `.from`, and Set for `.intersection` so distinct lines pick distinct polyfills.
const fromArr = _Array$from([1, 2]);
const intersect = (() => { 'use strict'; return _Set; })().prototype.intersection;
export { fromArr, intersect };