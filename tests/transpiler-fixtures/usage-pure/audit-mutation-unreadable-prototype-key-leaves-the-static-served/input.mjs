// a prototype receiver whose member key the pass cannot read leaves its members unknown, not the
// constructor: nothing here assigns `Number` itself, so the static read is served and the debug
// channel reports no name left native - a slot-mutation warning would name an edit the source never made
Number.prototype[key] = patch;
Number.isFinite(1);
