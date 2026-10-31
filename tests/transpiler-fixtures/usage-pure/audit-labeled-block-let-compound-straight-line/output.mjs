import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// labeled bare block. LabeledStatement.body is the inner BlockStatement whose
// `.body` is an array; the straight-line walker must descend through the label
// the same way it descends through a free-standing block. includes is
// array+string ambiguous so the narrow is driven by flow, not the method.
outer: {
  let x: string | number[] = [1];
  x = "  hello  ";
  _includesMaybeString(x).call(x, "h");
}