const seen = [];
// for-await reaches the head through its own statement type
async function drain(source) {
  for await (const { at, ...rest } of source) {
    seen.push(typeof at, 'at' in rest, rest.extra);
  }
}
export { seen };
export { drain };
