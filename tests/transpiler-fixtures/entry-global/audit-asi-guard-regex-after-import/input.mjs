// removing the entry import must not fuse the next line's regex literal `/^x/` onto
// the previous `var x = 1` expression - without an injected `;`, the parser sees
// `var x = 1 / ^x / .test('')` (division chain, syntax error at `^x`) - the reprint
// terminates the statement itself, a division operator would fuse the same way
var x = 1
import 'core-js/actual/array/from'
/^x/.test('')
