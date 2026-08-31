import { agents } from 'caniuse-lite';
import { canonicalEngine } from '../domain/target-key.js';

let byEngine = null;

// read out of `caniuse-lite` rather than asked of `browserslist.coverage`: that one reports the
// share of exactly the version named, and a threshold is a version almost nobody runs - nearly
// every bucket would weigh zero, leaving the warm-up nothing to order by
function collectShares() {
  const collected = new Map();

  for (const [name, agent] of Object.entries(agents)) {
    const engine = canonicalEngine(name);
    if (engine === null || !agent?.usage_global) continue;

    let versions = collected.get(engine);
    if (!versions) collected.set(engine, versions = []);

    for (const [version, share] of Object.entries(agent.usage_global)) {
      if (!share) continue;
      // caniuse gives one figure for a whole range of versions - `26.0-26.2` - and it is counted
      // at the lower bound: anywhere higher would credit a threshold inside the range with the
      // visitors who are below it, and those belong to the bucket before it
      const [lower] = String(version).split('-', 1);
      if (/^\d/.test(lower)) versions.push([lower, share]);
    }
  }

  return collected;
}

// the traffic shares port, declared by the domain. the data goes stale between releases of
// `caniuse-lite`, and what goes wrong then is the ORDER the buckets are warmed in, never which
// bundle a visitor gets
export default function trafficShares(engine) {
  byEngine ??= collectShares();
  return byEngine.get(engine) ?? [];
}
