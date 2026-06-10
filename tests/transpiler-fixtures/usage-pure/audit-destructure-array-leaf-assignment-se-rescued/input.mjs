// a chain-assignment that IS the array-descended leaf classifies through resolveObjectName's own
// chain-assignment peel and is rescued WHOLE: the binding update and the IIFE setup run once, and
// the binding still gets the polyfill (a bail here would silently lose it)
let calls = 0;
let a;
const [{
  from
}] = [a = (() => {
  calls++;
  return Array;
})()];
