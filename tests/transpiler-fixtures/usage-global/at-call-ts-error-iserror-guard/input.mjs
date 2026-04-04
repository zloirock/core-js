function foo(x: string[] | Error) {
  if (!Error.isError(x)) {
    x.at(-1);
  }
}
