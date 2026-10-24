// `typeof Enum.Member` via `typeof Enum` annotation - enums are type-bearing declarations
// without a regular type-annotation slot, but the plugin maps each member to the type of
// its initialiser. Color.Red has a string initialiser, so `.at(0)` on it routes to the
// String instance polyfill
enum Color { Red = 'r', Green = 'g' }
declare const cons: typeof Color;
cons.Red.at(0);
