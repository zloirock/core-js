import _Array$from from "@core-js/pure/actual/array/from";
// a backtick inside a regex literal must be classified as regex content, not a template
// opener - otherwise a phantom template region spans to EOF, swallows the next statement
// boundary, and the ASI guard fails to inject the leading `;`. the regex would then fuse with
// the following `(`-leading polyfill replacement (regex invoked as a function -> TypeError).
// the `;` must land between the regex statement and the rewritten call. unplugin-only -
// babel terminates the regex statement with `;` during codegen.
function g() {}
var re = /a`b/;
(g(), _Array$from)([1]);