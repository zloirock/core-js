// an indirect-require core-js entry (`(prefix, require)('core-js/...')`) under a package the plugin
// manages keeps its observable prefix as statements, and the prefix is still LIVE for the usage
// sweep: the `at` calls inside it are polyfilled (a memo ref for the literal receiver included).
// keeping the prefix by point edits around the elements, not by overwriting the whole statement,
// is what lets those rewrites land - an edit inside an overwritten span is one MagicString refuses
let arr = [1];
(arr.at(0), require)("core-js/modules/es.array.includes");
([1].at(0), require)("core-js/modules/es.array.from");
(0, ([2].at(1), require))("core-js/modules/es.array.of");
export const r = arr;
