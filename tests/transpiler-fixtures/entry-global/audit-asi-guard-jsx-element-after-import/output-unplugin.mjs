import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// removing the entry import must not fuse the next line's JSX element opener `<div>`
// onto the previous `var x = 1` expression - without an injected `;`, the parser would
// see `var x = 1 < div > null` (less-than chain) before JSX-mode bails out. `<` in
// ASI_HAZARD_STARTS covers both TS TypeAssertion and JSX top-level element opener
var x = 1
;<div>{null}</div>
