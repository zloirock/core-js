function noTag({ fromEntries, ...rest } = Object) {
  return [fromEntries, rest];
}

export const control = noTag();
