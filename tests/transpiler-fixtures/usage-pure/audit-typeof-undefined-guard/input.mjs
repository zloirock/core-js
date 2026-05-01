function take(input: unknown) {
  if (typeof input !== 'undefined') {
    if (typeof input === 'string') {
      return input.at(0);
    }
  }
  return null;
}
