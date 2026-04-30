function take(input: unknown) {
  if (!!(typeof input === 'string')) {
    return input.at(0);
  }
}
