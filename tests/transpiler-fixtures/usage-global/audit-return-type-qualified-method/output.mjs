import "core-js/modules/es.array.at";
// Multi-segment qualified type-query (`typeof X.inner.fn`) - exercises the segment walk
// in `findTypeQueryFunctionType` past the first hop, ensuring the TSMethodSignature handling
// composes with annotation-segment traversal. String element type cross-checks that the
// returned signature carries the precise return-type narrowing (`Array<string>` not generic).
declare const X: {
  inner: {
    fn(): string[];
  };
};
type R = ReturnType<typeof X.inner.fn>;
declare const r: R;
r.at(-1);