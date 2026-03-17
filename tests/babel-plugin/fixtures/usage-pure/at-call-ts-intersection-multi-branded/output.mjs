import _atInstanceProperty from "@core-js/pure/actual/instance/at";
declare const s: string & {
  __brand: 'A';
} & {
  __tag: 'B';
};
_atInstanceProperty(s).call(s, 0);