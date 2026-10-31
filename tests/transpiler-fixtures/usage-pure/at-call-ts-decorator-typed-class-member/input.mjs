function dec(v: any) { return (_: any) => _; }

class Box {
  // @ts-expect-error the decorator is an opaque read probe, not a callable tsc can check
  @dec((arr: string[]) => arr.at(0))
  method() {}
}
