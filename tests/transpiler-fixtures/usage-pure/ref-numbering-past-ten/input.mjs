// twelve optional-chain instance calls in a row force twelve temp refs. verifies that
// the allocated names cross the decimal boundary - `_ref10` / `_ref11` must not collide
// with the earlier `_ref` / `_ref1`-shape digits when the suffix generator counts up
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
