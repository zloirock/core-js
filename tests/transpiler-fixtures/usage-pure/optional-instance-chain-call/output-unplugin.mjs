import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
_flatMaybeArray(foo) == null ? void 0 : _flatMaybeArray(foo).call(foo).valueOf();