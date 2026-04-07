// regression for own UID generator: babel's scope.generateUidIdentifier
// strips trailing digits, so after `_ref9` it would emit `_ref0`, `_ref1` instead
// of `_ref10`, `_ref11`. eleven optional-chain method calls forces eleven temp refs.
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
