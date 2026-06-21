// discriminated union behind a NAMED alias, wrapped in `| null`: `type Inner = A | B; type
// Outer = Inner | null`. the outer union has [Inner-ref, null] as branches; Inner-ref must be
// followed through its alias to expose the inner [A, B] members before the discriminant filter
// can match each. without the flatten, the `kind` member is a union of all literals and passes permissively.
type Inner = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
type Outer = Inner | null;
declare const x: Outer;
if (x.kind === 'a') {
  x.data.at(0);
}
