function pick(input: Record<string, unknown>) {
  if (typeof input === 'string') {
    return input.at(0);
  }
  return null;
}
