// user already imports the polyfill the plugin would otherwise inject. expect plugin
// to reuse the user's local binding instead of allocating a new `_Array$from` with
// suffixing. verifies `addPureImport`'s `existingPureImports.has(source)` short-circuit
import MyArrayFrom from '@core-js/pure/actual/array/from';
console.log(MyArrayFrom([1, 2, 3]));
function inner() {
  return Array.from('abc');
}
inner();
