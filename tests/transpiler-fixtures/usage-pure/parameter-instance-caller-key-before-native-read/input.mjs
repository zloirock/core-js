// A known caller mirrors instance methods and keeps native reads after key effects.
// The passthrough getter closes over the receiver captured at the argument site.
const events = [];
function read({ at, [(events.push('key'), 'flat')]: flat, length }) {
  return [at, flat, length];
}
export const result = read(Array.prototype);
