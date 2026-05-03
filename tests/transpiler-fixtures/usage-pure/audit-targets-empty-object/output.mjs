// `targets: {}` is a valid config-input that targetsParser parses to Map(0): "no engines"
// = "everything supported" = no polyfills needed. semantically equivalent to running on a
// modern engine where every feature is native. layer-appropriate: targetsParser owns input
// shape semantics, provider passes through. lock the design contract
[1, 2].at(0);
'abc'.replaceAll('a', 'b');