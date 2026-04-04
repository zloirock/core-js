function foo(x: number[]) {
  (x satisfies readonly number[]).at(-1);
}
