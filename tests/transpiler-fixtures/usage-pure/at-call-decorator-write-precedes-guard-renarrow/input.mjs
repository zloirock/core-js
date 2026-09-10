// the same class-definition-time write, standing BEFORE the guard: the narrow is established after
// the decorator already ran, so it holds over the read and only the string family injects. the
// negative of the fixture beside it - a decorator write recovered without its position in the tree
// reads as a capture and bails the narrow, which over-injects here
export function f(y: any) {
  let x: any = y;
  class D {
    @((x = "s", (t: any, k: any) => t)) m() { return 1; }
  }
  if (typeof x === "string") return x.at(0);
  return null;
}
