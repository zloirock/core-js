function dfl(a = [1]) { return a; }
const viaDefaultAlias = dfl(...wrapped);
viaDefaultAlias.at(0);
export { viaDefaultAlias };
