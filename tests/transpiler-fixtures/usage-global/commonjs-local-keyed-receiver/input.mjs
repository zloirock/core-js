// A later key effect cannot replace an unescaped variable in the CommonJS wrapper.
var list;
list = [3, 4];
var log = [];
module.exports = { last: list[(log.push("key"), "at")](-1), log };
