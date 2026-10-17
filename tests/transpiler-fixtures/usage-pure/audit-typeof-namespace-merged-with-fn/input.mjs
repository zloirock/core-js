// declaration merging: `function fn` + `namespace fn { function inner }`. the
// outer `fn` is a runtime binding; `fn.inner` is a namespace member. typeof
// resolution must walk INTO the merged namespace to reach `inner` - resolving the
// outer binding alone leaves the member lookup falling through, so the namespace
// branch must fire and resolve `fn.inner` to its declared return type.
declare function fn(): string;
declare namespace fn {
  function inner(): number[];
}
const r: ReturnType<typeof fn.inner> = [1, 2];
r.at(0);
