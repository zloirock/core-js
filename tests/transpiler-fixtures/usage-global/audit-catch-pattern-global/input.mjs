// usage-global: CatchClause destructuring is NOT pattern-extracted (only usage-pure
// does that). Still, destructured `at` triggers instance-at polyfill detection, even
// though no rewrite happens — the raw globalThis Array.prototype.at is assumed usable.
try {} catch ({ at }) { at(0); }
