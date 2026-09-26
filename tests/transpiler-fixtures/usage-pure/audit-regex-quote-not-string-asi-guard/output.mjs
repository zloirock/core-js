import _Array$from from "@core-js/pure/actual/array/from";
// a QUOTE inside a regex literal (`/a"b/`) must be classified as regex content, not a string
// opener - otherwise a phantom string region swallows the boundary and the ASI guard skips the
// leading `;`, fusing the regex with the following `(`-leading polyfill (regex invoked as a
// function -> TypeError). companion to the backtick case (template-region path); this exercises
// the string-region path of the same regex-tracking fix. unplugin-only.
function g() {}
var re = /a"b/;
(g(), _Array$from)([1]);