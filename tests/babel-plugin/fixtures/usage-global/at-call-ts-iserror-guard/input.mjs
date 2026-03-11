function foo(x: string | Error) {
  if (Error.isError(x)) {
    // error branch
  } else {
    x.at(-1);
  }
}
