import _at from "@core-js/pure/actual/instance/at";
var _ref;
// partial optional chain `x.a?.b.c`: only the optional segment guards downstream
// rewrites; the leading non-optional access stays unguarded.
null == (_ref = a?.b?.c) ? void 0 : _at(_ref).call(_ref, -1);