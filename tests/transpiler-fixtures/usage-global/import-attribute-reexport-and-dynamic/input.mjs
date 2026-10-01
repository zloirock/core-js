// re-export form (`export { x } from '...' with { type: 'json' }`) and dynamic-import form
// (`await import('...', { with: { type: 'json' } })`) - both preserve the with-clause
// through transformation; downstream `.at(-1)` on the dynamic-import result triggers the
// usual usage detection
export { entries } from './data.json' with { type: 'json' };
async function load() {
  const m = await import('./other.json', { with: { type: 'json' } });
  return m.values.at(-1);
}
load();
