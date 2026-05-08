// User imports the pure `array/from` polyfill under a custom name; the plugin must dedup against it.
// The user's binding must seed alias-chain narrowing so `arr.at` picks the array-specific polyfill.
import MyArrayFrom from '@core-js/pure/actual/array/from';
const arr = MyArrayFrom('hi');
arr.at(-1);
arr.findLast(x => x);
arr.flat();
