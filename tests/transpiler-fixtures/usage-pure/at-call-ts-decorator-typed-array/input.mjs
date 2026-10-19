const arr: number[] = [1, 2, 3];
function dec(v: any) { return (_: any) => _; }

@dec(arr.at(0))
class A {
  // @ts-expect-error the decorator is an opaque read probe, not a callable tsc can check
  @dec(arr.at(1))
  method() {}
}
