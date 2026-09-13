// Several optional navigation links over one environment probe share its nullish branch.
// Array.from remains polyfilled on the defined continuation. No other claim supplies its import.
const probe = globalThis.window;
export const navigation = probe?.self?.window.Array.from([1]);
