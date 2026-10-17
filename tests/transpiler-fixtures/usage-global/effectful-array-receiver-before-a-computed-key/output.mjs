import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
// A computed key runs after an effectful array initializer.
// The instance method reads that array once and retains its Array family.
const events = [];
function source() {
  events.push('source');
  return 1;
}
const {
  [(events.push('key'), 'at')]: method
} = [source()];
export const result = method.call([8], 0);
export { events };