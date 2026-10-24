// A DISCRIMINANT field write (`s.kind = "b"`) inside a loop body flips the variant the OUTER guard tested before the use re-reads
// it on the next iteration, so the narrow must drop to generic - a stale `_atMaybeArray` would throw on variant "b"'s string at
// runtime (ie:11).
interface VariantA {
  kind: "a";
  arr: number[];
}
interface VariantB {
  kind: "b";
  arr: string;
}
type V = VariantA | VariantB;

function loopMutates(s: V, cond: () => boolean) {
  if (s.kind === "a") {
    while (cond()) {
      s.arr.at(-1);
      // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
      s.kind = "b";
    }
  }
}
