// dynamic `await import(varName)` with a variable source argument is a runtime call
// whose target isn't statically known. the entry detector cannot determine which entry
// to expand, so the call must stay as-is (no substitution)
async function loadLater(spec) {
  await import(spec);
}
loadLater('core-js/actual/array/from');
