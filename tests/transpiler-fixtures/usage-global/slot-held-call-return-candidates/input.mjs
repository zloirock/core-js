// a container slot holding a local call hands on whatever the call may return, so a static read off
// the slot is served where the call names one constructor - a parameter default, through an array slot
// and a typeof probe alike. a logical arm is a single return that selects, a route the census does not
// follow: pure keeps the narrow entry there, and usage-global injects the static by its key
function withDefault(M = Map) { return M; }
function withArm(P) { return P || Promise; }
function url(U = URL) { return U; }
const list = [withDefault()];
export const grouped = list[0].groupBy([1], x => x);
export const attempted = ({ P: withArm() }).P.try(() => 1);
export const parses = typeof [url()][0].canParse;
