const arr: number[] = [1, 2, 3];
function dec(v: any) { return (_: any) => _; }

@dec(arr.at(0))
class A {
  @dec(arr.at(1))
  method() {}
}
