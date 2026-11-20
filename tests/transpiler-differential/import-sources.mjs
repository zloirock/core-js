import { parseFixtureOrNull } from '../unplugin/fixture-lang.mjs';
import { importSources } from '../unplugin/phase-imports.mjs';

// Compare actual module sources, including imports sharing a line or spanning several.
// This oracle is not a runtime evaluation input and does not invalidate cached values.
export function importSet(code) {
  const parsed = parseFixtureOrNull('input.ts', code) ?? parseFixtureOrNull('input.tsx', code);
  if (!parsed) throw new Error('output does not parse for the differential import-set compare');
  return new Set(importSources(parsed.program)
    .filter(source => /^(?:core-js|@core-js\/pure)(?:\/|$)/u.test(source)));
}
