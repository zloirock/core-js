import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// three-level chained generic indexed access `T['a']['b']['c']`: walked solver
// must descend the call-site argPath through every intermediate hop before
// resolving the leaf via resolveObjectLiteralProperty
declare function pick<T>(o: T): T['a']['b']['c'];
const r = pick({
  a: {
    b: {
      c: ["x", "y", "z"]
    }
  }
});
_includesMaybeArray(r).call(r, "x");