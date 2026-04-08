function dec(v: any) { return (_: any) => _; }

@dec(((): number => {
  const local: number[] = [1, 2, 3];
  return local.at(0);
})())
class A {}
