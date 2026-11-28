function kind(input) {
  return kind = typeof Symbol === 'function' ? function (value) { return typeof value; } : function () { return 'object'; }, kind(input);
}
function keep(value) { return value; }
export function classify(input) { const source = keep(input); return kind(source); }
export function check(object) { return Object.keys(object).every(key => key.length > 0); }
