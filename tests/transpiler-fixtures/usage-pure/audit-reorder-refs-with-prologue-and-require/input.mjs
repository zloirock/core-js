'use strict';
// The memo for the result of from(arr) belongs after the directive and all requires.
require('side-effect-module');
const { from } = Array;
const arr = from('hi');
const tail = from(arr).at(-1);
const found = arr.findLast(x => x);
const flat = arr.flat();
console.log(tail, found, flat);
