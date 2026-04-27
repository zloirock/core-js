// synth-swap bails when IIFE caller-arg is `null`: `(({from}) => from)(null)`. null isn't
// a classifiable receiver Identifier - findSynthSwapReceiver returns null, plugin doesn't
// know what static methods to bind. inline-default doesn't fire either (no `= R` slot).
// runtime: destructure of null throws TypeError - user code is bug, plugin emits as-is
(({ from }) => from)(null);
