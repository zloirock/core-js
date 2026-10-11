// an explicit store through an alias lands where the alias points, as a member write through it does: through
// an alias of an object this file does not own it hands the stored constructor out with its statics, and
// through an alias of a container only this file holds it hands nothing out
const lib = window.MyLib;
Object.assign(lib, { Kind: Promise });
const quiet = {};
const unread = quiet;
Object.assign(unread, { Pool: Number });
