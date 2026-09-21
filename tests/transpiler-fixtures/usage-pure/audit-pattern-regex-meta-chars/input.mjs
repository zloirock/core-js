// string include/exclude patterns are wrapped raw in regex anchors. literal `(` `)`
// in the pattern is parsed as a capture group: `array/at(0)` is no entry the map knows and
// matches no module name as a regex, so validation reports it as unmatched - the regex itself is
// valid. users expecting glob-shorthand here should use a RegExp option form instead
'str'.at(-1);
