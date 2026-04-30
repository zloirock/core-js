function take(input: unknown) {
  if (Array.isArray?.(input)) {
    return input.at(0);
  }
  return null;
}
