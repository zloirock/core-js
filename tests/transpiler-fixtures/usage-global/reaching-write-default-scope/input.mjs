let C = Array;
function install(value = (C = { from() { return 19; } })) { var C; }
install();
export const value = C.from([8]);
