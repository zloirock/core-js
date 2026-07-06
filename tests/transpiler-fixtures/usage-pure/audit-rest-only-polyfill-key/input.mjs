// Single polyfillable key + rest element: rest is present, so the property-rebuild step renames `from`
// to _unused, rest collects everything else. `const from = _Array$from` extracted
// with `const { from: _unused, ...rest } = Array` for rest construction.
const { from, ...rest } = Array;
rest;
