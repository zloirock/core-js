export function gathered({ URL: { canParse, ...others } = SuppressedError } = globalThis) {
  return [canParse, others];
}
