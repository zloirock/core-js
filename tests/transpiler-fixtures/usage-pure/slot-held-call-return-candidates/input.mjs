// A call may return its default constructor or select it in the body.
// An ensuing static read needs the method on the resulting constructor.
function withDefault(M = Map) { return M; }
function withArm(P) { return P || Promise; }
function url(U = URL) { return U; }
const list = [withDefault()];
export const grouped = list[0].groupBy([1], x => x);
export const attempted = ({ P: withArm() }).P.try(() => 1);
export const parses = typeof [url()][0].canParse;
