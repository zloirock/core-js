// the debug channel says WHY a name was left native, and a prototype receiver whose member key the
// pass cannot read is not the same reason as a slot write: nothing here assigns `Number` itself, so
// reporting a slot mutation would name an edit the source never made. the write below taints the
// whole name, the read is left native, and the warning is the only place that distinction is
// visible at all
Number.prototype[key] = patch;
Number.isFinite(1);