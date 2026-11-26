import "core-js/modules/es.array.at";
type U = {
  kind: 'a';
  v: number[];
} | {
  kind: 'b';
  v: string;
};
declare const disc: U;
if (disc.kind === 'a') disc.v.at(0);