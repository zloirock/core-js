// The sibling static is spelled BEFORE the effectful computed key, so its claim is taken while the
// pattern still stands and the rebuild meets a prop another channel already owns.
// Each binding is written exactly once, and the key runs once in its source position.
let e = 0, from, o;
({ from, [(e++, 'of')]: o } = Array);
export const r = [from, o, e];
