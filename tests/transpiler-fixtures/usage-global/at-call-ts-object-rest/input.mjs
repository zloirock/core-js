function foo({ a, ...rest }: { a: number, b: string }) {
  rest.at(-1);
}
