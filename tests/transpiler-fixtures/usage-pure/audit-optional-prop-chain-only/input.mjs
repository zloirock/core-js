// `obj?.foo.bar` rewritten to a guarded call must keep the dot between `foo` and `bar` -
// only the optional hop is removed.
obj?.foo.bar.at(0);
