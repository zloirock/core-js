const arr: number[] = [1, 2, 3];
function dec(v: any) { return (_: any) => _; }

@dec((() => {
  const arr: string = 'hello';
  return arr.at(0);
})())
class A {}
