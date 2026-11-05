// TS wrappers around spread arguments preserve the actual call and array values.
// The separate static-only wrapper retains its native of read.
{
  // @ts-expect-error a spread argument tsc cannot place is the shape under test
  const r = ((a: any) => a)(...([Array] as any));
  const [{
    of: o
  }] = [...[Array]];
}