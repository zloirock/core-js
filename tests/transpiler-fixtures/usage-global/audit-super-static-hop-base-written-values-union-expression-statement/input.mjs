let closureNs = { Base: Boolean };
const set = () => { closureNs = { Base: Promise }; };
set();
