// The identity of a cell, computed ONCE: everything that names one reads a field from here, and a
// second spelling would be silent - the run stays green while a page lands in a directory the
// manifest does not name. No dependency on the bundler, so the raw tier can ask too.
import { METHODS, PROVIDERS, phasesFor, pluginOpts as matrixOpts } from '../transpiler-integration/matrix.mjs';

export { METHODS, PROVIDERS, phasesFor };

export const SUPPORTED_ENGINES = 'IE 11, Chrome>=38, Safari>=7.1, FF>=15';

// a cell carries a phase its (method, provider) pair supports, so an unsupported one is a defect here
// rather than a value to drop
export function pluginOpts({ method, phase }) {
  return matrixOpts(method, phase ?? undefined, { targets: SUPPORTED_ENGINES });
}

// `entry-global` never reads the library, so it has nothing to drift from and gets no baseline name
function isSnapshotted(method) {
  return method !== 'entry-global';
}

export function cell({ lib, method, provider, phase }) {
  // segments are the source and the label is derived, not the reverse: `join` would put the platform
  // separator in, and karma matches `files` through glob, where a backslash escapes and matches nothing
  const segments = [lib.name, provider, method, ...phase ? [phase] : []];
  return {
    lib,
    method,
    provider,
    phase: phase ?? null,
    label: segments.join('/'),
    segments,
    snapshot: isSnapshotted(method) ? `${ lib.name }.${ provider }.${ method }${ phase ? `.${ phase }` : '' }.txt` : null,
    // the unit a shard may take: a split group would leave a phase with no reference
    group: `${ lib.name }/${ method }`,
    // no phase axis, so its set is the REFERENCE the unplugin phases are deltas from
    isReference: provider === 'babel-plugin',
  };
}

// Grouped by (library x method), every group opening with its reference - `PROVIDERS` puts
// babel-plugin first and the nesting preserves it. Changing either leaves a phase diffed against
// nothing, which `runtime.mjs` turns into a thrown error rather than a silently empty diff.
export function groupByLibraryAndMethod(libraries) {
  const all = [];
  for (const lib of libraries) {
    for (const method of METHODS) {
      const group = [];
      for (const provider of PROVIDERS) {
        for (const phase of phasesFor(method, provider)) group.push(cell({ lib, method, provider, phase }));
      }
      all.push(group);
    }
  }
  return all;
}

// Every cell the REGISTRY produces, whatever this run was filtered to - what the orphan check needs,
// since a baseline with no cell behind it sits in git looking like coverage and nothing reads it.
export function allCells(libraries) {
  return groupByLibraryAndMethod(libraries).flat();
}
