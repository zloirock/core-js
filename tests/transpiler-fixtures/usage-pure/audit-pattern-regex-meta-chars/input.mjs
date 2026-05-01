// string include/exclude patterns are wrapped raw in regex anchors. literal `(` `)`
// in the pattern is parsed as a capture group: `array/at(0)` regex matches `array/at0`
// (group with `0`), not the literal source. validation reports
// "didn't match any polyfill" for the literal but the regex itself is valid - users
// expecting glob-shorthand here should use a RegExp option form instead
'str'.at(-1);
