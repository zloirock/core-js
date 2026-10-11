// a write through an alias of an object this file does not own - an export object, a member of a realm
// namespace or of an undeclared global, an alias of such an alias - hands the written constructor out
// with its statics, as the write spelled through that object does; a write through an alias of a container
// only this file holds hands nothing out
var exported = module.exports;
exported.Store = Map;
var api = exports;
api.Queue = Promise;
var lib = window.MyLib;
lib.Walker = Iterator;
const nested = sink.inner;
nested.Key = Symbol;
var hop = module.exports;
var again = hop;
again.Link = URL;
const local = {};
const quiet = local;
quiet.Pool = Error;
