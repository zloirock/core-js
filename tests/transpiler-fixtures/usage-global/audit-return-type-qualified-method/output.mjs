import "core-js/modules/es.array.at";
// multi-segment qualified type-query (`typeof X.inner.fn`) - the segment walk must descend
// past the first hop and compose TSMethodSignature handling with annotation traversal. the
// string element type cross-checks the resolved signature carries the precise return-type
// narrowing (`Array<string>` not generic).
declare const X: {
  inner: {
    fn(): string[];
  };
};
type R = ReturnType<typeof X.inner.fn>;
declare const r: R;
r.at(-1);