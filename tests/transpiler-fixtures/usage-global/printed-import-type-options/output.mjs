import "core-js/modules/es.array.at";
// Type-only import attributes survive printing before downstream type resolution.
// @ts-expect-error The external type package is intentionally absent from this fixture.
export type Value = typeof import("printer-types",{
  with: {
    "resolution-mode": "import"
  }
}).default;
[7].at(0);