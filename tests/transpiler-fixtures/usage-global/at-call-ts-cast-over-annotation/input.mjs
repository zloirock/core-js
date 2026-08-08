function foo(x: string) {
  (x as any as number[]).at(-1);
}
