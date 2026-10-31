export function inlineWithHeldIdentityResult() {
  return Object.freeze({
    entries: [1, 2],
    read() {
      return this.entries.includes(1);
    }
  });
}
