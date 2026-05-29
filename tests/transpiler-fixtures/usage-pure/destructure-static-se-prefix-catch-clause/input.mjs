// a destructured static (`from`) whose receiver sits behind a side-effect prefix containing a
// catch clause that binds an instance-method name: the catch rewrite is queued as a point-insert
// inside the prefix while the static extraction overwrites the whole declaration around it, so the
// insert must be relocated into the lifted prefix text rather than left anchored inside the
// overwrite. both flavors emit the catch-bound instance polyfill; the outputs differ only in
// codegen - babel renumbers the ref and drops the now-dead `Array` tail of the prefix, unplugin
// keeps the verbatim side-effect expression - see output-unplugin.mjs
const { from } = (setup(() => { try { run(); } catch ({ flat }) { flat([1]); } }), Array);
from([1, 2, 3]);
