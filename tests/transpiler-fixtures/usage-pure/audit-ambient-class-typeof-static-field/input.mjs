// `typeof K.rows` where K is an ambient `declare class` resolves its static-field type through the
// ambient-declaration index, so the array element drives a precise instance helper. Babel doesn't
// bind the ambient class as a value, so without the fallback the static type fails to resolve and
// the rewrite diverges from estree-toolkit (which binds it).
declare class K { static rows: string[]; }
declare const v: typeof K.rows;
v.includes(1);
