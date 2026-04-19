// regression for own UID generator: Babel's scope.generateUidIdentifier strips trailing
// digits, so after `_ref9` it would loop back and reuse `_ref` / `_ref2`. own generator
// emits `_ref, _ref2, _ref3, ..., _refN` (skip-1 babel convention) via the per-prefix
// suffix cache. twelve optional-chain calls force twelve temp refs; `_ref10` / `_ref11`
// must cross the decimal boundary without collision
a().b?.flat();
c().d?.flat();
e().f?.flat();
g().h?.flat();
i().j?.flat();
k().l?.flat();
m().n?.flat();
o().p?.flat();
q().r?.flat();
s().t?.flat();
u().v?.flat();
w().x?.flat();
