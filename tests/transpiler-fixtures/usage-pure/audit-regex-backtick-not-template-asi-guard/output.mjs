import _Array$from from "@core-js/pure/actual/array/from";
// a backtick inside a regex literal must read as regex content, not a template opener -
// else a phantom template region spans to EOF, swallows the next statement boundary, and
// the ASI guard skips the leading `;`, fusing the regex with the `(`-leading polyfill
// replacement (regex invoked as a function -> TypeError). unplugin-only; babel adds the `;`.
function g() {}
var re = /a`b/;
(g(), _Array$from)([1]);