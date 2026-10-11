// A call yields only what a return this build runs hands back: a return in an arm the build never
// takes returns nothing, and one after an `if` whose arm the build always takes and which always
// leaves never runs. An undecided test keeps every return.
function live(source) {
  if (typeof Promise != 'undefined') return 'abc';
  return source;
}

function dead() {
  if (typeof Promise == 'undefined') return [1];
  return 'abc';
}

function nested(source) {
  {
    if (typeof Promise != 'undefined') {
      return 'abc';
    }
  }
  return source;
}

function undecided() {
  if (globalThis.flag) return 'abc';
  return [1];
}

export const fromLive = live(input).at(0);
export const fromDead = dead().includes('b');
export const fromNested = nested(input).concat('d');
export const fromUndecided = undecided().slice(1);
