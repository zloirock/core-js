import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// removing the entry import must not fuse the next line's regex literal `/^x/` onto
// the previous `var x = 1` expression - without an injected `;`, the parser sees
// `var x = 1 / ^x / .test('')` (division chain, syntax error at `^x`). `/` is in
// ASI_HAZARD_STARTS for exactly this case (also covers division-operator fusing)
var x = 1
;/^x/.test('')
