// The first receiver read supplies the method's type again after print and reparse.
function get(value) { observe(); return value; }
export const array = get([7])[(key(), 'at')]?.(0).toFixed(1);
export const own = get({ at: null })[(key(), 'at')]?.(arg()).toFixed(1);
