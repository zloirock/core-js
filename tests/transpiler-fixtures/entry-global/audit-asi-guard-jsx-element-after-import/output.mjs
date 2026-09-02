import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// removing the entry import must not fuse the next line's JSX element opener `<div>`
// onto the previous `var x = 1` expression - without an injected `;`, the parser would
// see `var x = 1 < div > null` (less-than chain) before JSX-mode bails out - the reprint
// terminates the statement itself, a TS TypeAssertion opener would fuse the same way
var x = 1;
<div>{null}</div>;