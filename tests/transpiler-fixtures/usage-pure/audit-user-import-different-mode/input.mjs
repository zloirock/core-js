// user imports from `full/` but plugin mode is `actual` — `scanExistingCoreJSImports`
// strictly matches mode prefix so this user binding is NOT registered with the injector.
// plugin proceeds to inject its own `actual/array/from` import alongside user's `full/...`
import MyArrayFrom from '@core-js/pure/full/array/from';
Array.from(x);
console.log(MyArrayFrom);
