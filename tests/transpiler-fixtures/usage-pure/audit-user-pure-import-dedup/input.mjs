// user already imports the polyfill the plugin would otherwise inject. expect the plugin
// to reuse the user's local binding instead of allocating a new suffixed `_Array$from`.
// verifies the dedup short-circuit when an import from the same source already exists
import MyArrayFrom from '@core-js/pure/actual/array/from';
console.log(MyArrayFrom([1, 2, 3]));
function inner() {
  return Array.from('abc');
}
inner();
