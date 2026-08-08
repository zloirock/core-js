// a method's signature-local `<T>` is bound by its CALL ARGS, not the enclosing generic's `T`. when the
// return slot is EXTRACTED then substituted, that `<T>` must be shadowed before the class subst applies, or
// the enclosing `C<string[]>` captures it: the bare `T` return would resolve to `string[]` and inject the
// array-specific `<m>MaybeArray` helper on a value that is NOT an array (the real call return is the arg) -
// an ie:11 throw. shadowed, the return is `unknown`, so usage-pure BAILS (no helper) on `c.take(n).at(0)`. a
// NON-generic method returning the class `T` (the real `string[]`) still narrows to `_includesMaybeArray`,
// so the two contrast. a method-resolution-only delta - babel and unplugin share the provider verdict, so no
// sidecar

declare class C<T> {
  take<T>(x: T): T;
  get(): T;
}

declare const c: C<string[]>;
declare const n: number;

// signature-local <T> shadowed -> the return is unknown, so no wrong array-Maybe helper is injected
c.take(n).at(0);

// non-generic method returns the class T (= string[], a real array) -> array-specific includes
c.get().includes("a");
