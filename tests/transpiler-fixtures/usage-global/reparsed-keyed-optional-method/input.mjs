// A returned array retains its method type across a computed optional call and reparse.
function get(value) { observe(); return value; }
export const array = get([7])[(key(), 'at')]?.(0).toFixed(1);
