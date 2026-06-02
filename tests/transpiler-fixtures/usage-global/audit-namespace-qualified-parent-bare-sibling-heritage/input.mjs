// a namespace-qualified parent interface (`extends NS.Base`) whose heritage references a sibling
// by its bare name (`Base extends Inner`) must resolve `Inner` against NS's module body via the
// parent's lookup anchor, so `o` is array-typed and `.at` injects the array variant `es.array.at`;
// failing the anchor walk would leave `o` untyped and pull in `es.string.at` alongside it
namespace NS {
  export interface Inner extends Array<number> {}
  export interface Base extends Inner {}
}
interface I extends NS.Base {}
declare const o: I;
o.at(0);
