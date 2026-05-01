function pick(input: unknown) {
  if ((input instanceof Array) === false) {
    return null;
  }
  return input.at(0);
}
