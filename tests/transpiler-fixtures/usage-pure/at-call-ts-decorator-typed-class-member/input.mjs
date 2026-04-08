function dec(v: any) { return (_: any) => _; }

class Box {
  @dec((arr: string[]) => arr.at(0))
  method() {}
}
