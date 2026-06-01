import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// removing the entry import must not fuse the next line's template literal head onto
// the previous `var x = tag` identifier - without an injected `;`, the parser sees
// `var x = tag`hello`` as a TaggedTemplateExpression (call `tag` with quasi `hello`).
// `` ` `` is in ASI_HAZARD_STARTS to guard exactly this case
var x = tag
;`hello`
