// One source evaluation supplies every extraction and the retained residual.
// Bodyless and discarded-sequence hosts preserve the surrounding effects.
export function read(holder, before, after) {
  let at, includes, length;
  ({ at, includes } = (before(), holder.rows));
  if (holder) ({ at, length } = holder.rows);
  (before(), ({ at, includes } = holder.rows), after());
  return [at, includes, length];
}
