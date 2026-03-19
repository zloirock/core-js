import _at from "@core-js/pure/actual/string/at";
declare const s: string & {
  __brand: 'A';
} & {
  __tag: 'B';
};
_at(s).call(s, 0);