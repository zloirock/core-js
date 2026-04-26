// partial optional chain `x.a?.b.c`: only the optional segment guards downstream
// rewrites; the leading non-optional access stays unguarded.
a?.b?.c?.at(-1);
