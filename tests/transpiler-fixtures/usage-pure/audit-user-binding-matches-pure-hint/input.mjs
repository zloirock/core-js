// user declares a local const with the exact name plugin would pick for the pure hint
// `_Array$from`. plugin's `uniqueName` probes suffixes via `isNameTaken`; collision
// detected, plugin falls back to `_Array$from2`. verify both plugins handle naming
const _Array$from = { custom: true };
Array.from([1, 2, 3]);
console.log(_Array$from);
