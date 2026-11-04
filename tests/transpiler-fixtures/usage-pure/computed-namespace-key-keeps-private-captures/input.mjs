// The namespace publishes the source bindings while its computed key retains its original position.
const effects = [];
function mark() { effects.push('key'); }
namespace Surface {
  export const { globalThis: { [(mark(), 'Promise')]: { resolve } }, Infinity: infinity } = globalThis;
}
export { Surface, effects };

