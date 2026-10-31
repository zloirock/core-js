import "core-js/modules/es.array.at";
// numeric indexed-access into an infer-conditional true branch: `v[0]` where v's type is
// `T extends Array<infer U> ? U[] : never`. the inferred U is threaded through the numeric index
// so v[0] resolves to its element type (string[]) and `.at` narrows to es.array.at alone, with no
// ambiguous es.string.at. the array check fires the true branch even though `infer` makes the
// extends structurally undecidable for the branch picker
type C<T> = T extends Array<infer U> ? U[] : never;
declare const v: C<string[][]>;
v[0].at(0);