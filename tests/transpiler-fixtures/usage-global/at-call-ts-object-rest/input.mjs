function foo({ a, ...rest }: { a: number, b: string }) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  rest.at(-1);
}
