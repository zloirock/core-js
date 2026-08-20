import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// @flow
// Flow spells every type declaration twice, plain and ambient, and the ambient spellings are
// separate node types. The plain forms already resolved, so the ambient ones fell through to
// the generic emission on every file that describes its types with `declare`. Distinct methods
// per arm: Array -> es.array.at, string -> es.string.includes, Array -> es.array.includes.
declare type Row = {
  cells(): Array<string>
};
declare interface Label {
  text(): string
}
declare opaque type Tags: {
  list(): Array<number>
};
declare var row: Row;
declare var label: Label;
declare var tags: Tags;
_atMaybeArray(_ref = row.cells()).call(_ref, 0);
_includesMaybeString(_ref2 = label.text()).call(_ref2, 'x');
_includesMaybeArray(_ref3 = tags.list()).call(_ref3, 1);