import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// TS merges `enum E {}` blocks, but the auto-numbering does not carry across the boundary: a
// member opening a later block restarts at 0, so it is numeric even where the previous block
// ended on a string. The absence of any array module is the first row's verdict - an opaque
// receiver would pull one in - while the second row proves the earlier block still resolves.
enum Labelled {
  Name = "core",
}
enum Labelled {
  Next,
}
const restarted: Labelled = Labelled.Next;
const known: Labelled = Labelled.Name;
restarted.at(0);
_includesMaybeString(known).call(known, "c");