// Required captures remain private; only the source bindings are exported.
export const head = before(), [{ other, at = fallback() }] = [receiver], tail = after();
