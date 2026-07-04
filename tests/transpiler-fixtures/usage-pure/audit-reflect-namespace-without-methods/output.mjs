import _Reflect from "@core-js/pure/actual/reflect/namespace";
// a VALUE-only usage (feature detect / escaped value) injects just the namespace entry -
// the object existence - and no method modules
export const supported = _Reflect ? "yes" : "no";
export const escaped = _Reflect;