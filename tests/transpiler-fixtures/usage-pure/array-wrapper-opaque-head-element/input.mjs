// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
export function read(unknown) {
  const log = [];
  for (const e of [Array]) {
    const [{ [(log.push('k'), 'of')]: of, fromAsync: from }, { at, length }] = [e, unknown];
    use(of, from, at, length);
  }
  return log;
}
