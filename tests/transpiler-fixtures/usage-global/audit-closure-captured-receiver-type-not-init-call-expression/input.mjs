// A receiver read in a DEFERRED context runs after the surrounding statements, so a write that lands textually after it still
// reaches it - the declarator init alone no longer describes the receiver there.
let captured = null;
const read = () => captured.at(0);
captured = [];
export const a = read();
