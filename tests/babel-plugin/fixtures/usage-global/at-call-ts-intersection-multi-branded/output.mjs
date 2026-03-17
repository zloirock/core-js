import "core-js/modules/es.string.at";
declare const s: string & {
  __brand: 'A';
} & {
  __tag: 'B';
};
s.at(0);