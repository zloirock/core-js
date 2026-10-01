// All receiver getters run before the first extracted property read.
export function read(holder) {
  const [{ at }, { includes }] = [holder.first, holder.second];
  return [at, includes];
}
