import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// LabeledStatement-wrapped block in straight-line position: `outer: { x = "hello"; }`
// is forward-transparent (the label only matters when a labeled `break`/`continue`
// targets it, which would be caught by the preceding-sibling exit scan). `reachesStraightLine`
// accepts LabeledStatement as a transparent wrapper alongside BlockStatement / Program
let x = [1, 2, 3];
outer: {
  x = "hello";
}
_atMaybeString(x).call(x, 0);