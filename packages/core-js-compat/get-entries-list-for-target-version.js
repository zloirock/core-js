import { compare, intersection, normalizeCoreJSVersion } from './helpers.js';
import entriesByVersions from './entries-by-versions.json' with { type: 'json' };
import allEntries from './entries.json' with { type: 'json' };

const allEntriesList = Object.keys(allEntries);

export default function (raw) {
  const corejs = normalizeCoreJSVersion(raw);
  const result = Object.entries(entriesByVersions).flatMap(([version, entries]) => {
    return compare(version, '<=', corejs) ? entries : [];
  });
  return intersection(result, allEntriesList);
}
