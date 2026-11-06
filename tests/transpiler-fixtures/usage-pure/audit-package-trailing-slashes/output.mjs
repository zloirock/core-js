import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `package` option strips trailing slashes both for `packages` (detection array)
// and for `ctx.pkg` (emit base). join via `${pkg}/${subpath}` produces a single
// `/` separator regardless of how many trailing slashes the user provided
_atMaybeString('str').call('str', -1);