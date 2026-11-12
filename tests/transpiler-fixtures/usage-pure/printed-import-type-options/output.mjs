import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Type-only import attributes survive printing before downstream type resolution.
// @ts-expect-error The external type package is intentionally absent from this fixture.
export type Value = typeof import("printer-types",{
  with: {
    "resolution-mode": "import"
  }
}).default;
_atMaybeArray(_ref = [7]).call(_ref, 0);