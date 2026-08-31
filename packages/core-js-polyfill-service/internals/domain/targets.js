import targetsParser from '@core-js/compat/targets-parser';
import { CONFIGURATION, canonicalEngine, compare, compareVersions, toTargetKey } from './target-key.js';

// engines the compat data tracks that can never be the visitor - nothing here ever asks us for
// a page, and a bucket built for one is a bundle nobody downloads
const SERVER_ENGINES = new Set(['bun', 'deno', 'electron', 'hermes', 'node', 'react-native', 'rhino']);

// every version the compat data marks as a threshold - the version an engine stops needing some
// module at. thresholds, not the versions browserslist knows: between two of them the module
// list does not move, so one entry per threshold describes every version in between
function collectThresholds(data) {
  const thresholds = new Map();

  for (const engines of Object.values(data)) {
    for (const [engine, version] of Object.entries(engines)) {
      if (SERVER_ENGINES.has(engine)) continue;
      let versions = thresholds.get(engine);
      if (!versions) thresholds.set(engine, versions = new Set());
      versions.add(version);
    }
  }

  return new Map([...thresholds].map(([engine, versions]) => [engine, [...versions].sort(compareVersions)]));
}

// the declared support, reduced to the lower bound of each engine. the parser drops an engine it
// does not track without a word - one key lost sends its visitors to the baseline, and all of them
// lost leaves a declaration compat reads as "everything"
function resolveDeclaration(declaration, warn) {
  const resolved = targetsParser(declaration);

  if (typeof declaration === 'object' && !Array.isArray(declaration)) {
    for (const key of Object.keys(declaration)) {
      if (CONFIGURATION.has(key) || canonicalEngine(key) !== null) continue;
      warn(`targets:unknown:${ key }`, `\`${ key }\` is not an engine \`@core-js/compat\` knows, `
        + 'it was dropped from the declared targets');
    }
  }

  for (const engine of resolved.keys()) {
    if (!SERVER_ENGINES.has(engine)) continue;
    resolved.delete(engine);
    warn(`targets:server:${ engine }`, `\`${ engine }\` cannot be the visitor, `
      + 'it was dropped from the declared targets');
  }

  return resolved;
}

// the share of traffic each entry stands for, folded onto it by the same nearest-lower rule the
// matcher uses. traffic below the lowest entry belongs to the baseline and is left uncounted
function foldShares(versions, traffic) {
  const shares = new Map(versions.map(version => [version, 0]));

  for (const [version, share] of traffic) {
    if (!share || !/^\d/.test(String(version))) continue;
    let nearest = null;
    for (const threshold of versions) {
      if (compare(threshold, '<=', version)) nearest = threshold;
      else break;
    }
    if (nearest !== null) shares.set(nearest, shares.get(nearest) + share);
  }

  return shares;
}

// the declaration is optional, and by default there is none: then the lower bound is the floor of
// core-js itself and every threshold above it becomes an entry
export default function collectTargets({ data, declaration = null, shares = null, warn }) {
  const thresholds = collectThresholds(data);
  const floors = declaration === null ? null : resolveDeclaration(declaration, warn);
  const list = [];

  for (let [engine, versions] of thresholds) {
    if (floors !== null) {
      const floor = floors.get(engine);
      // an engine the declaration does not name gets no entries, and that is not reported: naming
      // the targets is a decision, and its visitors get the baseline - weight, never a missing module
      if (floor === undefined) continue;
      versions = [floor, ...versions.filter(version => compareVersions(version, floor) > 0)];
    }

    const folded = shares === null ? null : foldShares(versions, shares(engine));

    for (const version of versions) {
      list.push({ targetKey: toTargetKey(engine, version), engine, version, share: folded?.get(version) ?? 0 });
    }
  }

  // the same failure seen whole: a declaration from which NOTHING survived looks like none at all -
  // the plan comes out empty and every visitor falls back to the baseline. it costs weight, never
  // a missing module, which is why nothing else notices
  if (declaration !== null && !list.length) {
    warn('targets:empty', 'the declared targets name no engine that can be a visitor, so no bundle is '
      + 'built per browser and every visitor gets the baseline');
  }

  return { range: declaration, list };
}
