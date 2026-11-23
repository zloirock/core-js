// The returned receiver supplies only of; saving its local function is not a constructor escape.
// Argument mirroring must keep that function's return and its internal name intact.
let saved;
function read([{ of } = Array]) { return typeof of; }
read([(function source() { saved = source; return Array; })()]);
saved() === Array;
read([(function Array() { return Array; })()]);
