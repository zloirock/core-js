// user already imports `at` as a NAMED specifier from the instance/at pure module. plugin
// only dedupes against DEFAULT imports from the same module, so it doesn't recognise this
// named binding as covering its own polyfill need - it adds its own default import. result:
// two imports from the same module path (one default, one named), both live
import { at } from '@core-js/pure/actual/array/instance/at';
console.log(at([1, 2, 3], 0));
[4, 5, 6].at(1);
