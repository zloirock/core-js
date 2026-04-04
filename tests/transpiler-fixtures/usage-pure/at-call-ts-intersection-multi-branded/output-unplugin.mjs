import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare const s: string & { __brand: 'A' } & { __tag: 'B' };
_atMaybeString(s).call(s, 0);