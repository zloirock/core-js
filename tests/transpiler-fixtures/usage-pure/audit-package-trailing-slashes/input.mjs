// `package` option strips trailing slashes both for `packages` (detection array)
// and for `ctx.pkg` (emit base). join via `${pkg}/${subpath}` produces a single
// `/` separator regardless of how many trailing slashes the user provided
'str'.at(-1);
