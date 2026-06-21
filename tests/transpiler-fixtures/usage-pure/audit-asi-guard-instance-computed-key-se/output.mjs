import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed-key access with an SE prefix in the key: `arr[(bar(), 'at')](0)`. the polyfill
// wraps the receiver call in an SE, so the replacement is `(`-leading. landing it after an
// unterminated predecessor (`foo` expression-statement, where ASI does not insert `;`) would
// fuse it into `foo(bar(), ...)`, so the unplugin emit must prepend an ASI guard `;` for any
// `(`-leading replacement, not just optional-chain ones.
const arr = [1, 2, 3];
foo;
bar(), _atMaybeArray(arr).call(arr, 0);