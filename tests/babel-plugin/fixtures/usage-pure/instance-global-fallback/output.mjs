import _includesInstanceProperty from "@core-js/pure/actual/instance/includes";
const fn = x => x;
_includesInstanceProperty(fn).call(fn, 1);