// The of static has no import supplied by loop syntax; this isolates the pattern claim.
for (const { [(eff(), 'of')]: viaSeKey } of [Array]) viaSeKey([]);
