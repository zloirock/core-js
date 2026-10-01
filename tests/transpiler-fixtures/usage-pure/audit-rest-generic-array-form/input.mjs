// `Array<T>` container form for rest annotation - innerTypeParamName handles both T[] and Array<T>
function fn<T>(...xs: Array<T>): T { return xs[0]; }
const s = fn('hello');
s.at(0);
