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
row.cells().at(0);
label.text().includes('x');
tags.list().includes(1);
