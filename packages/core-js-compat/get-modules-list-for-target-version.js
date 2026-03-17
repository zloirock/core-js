import { compare, intersection, normalizeCoreJSVersion } from './helpers.js';
import modulesByVersions from './modules-by-versions.json' with { type: 'json' };
import allModules from './modules.json' with { type: 'json' };

export default function (raw) {
  const corejs = normalizeCoreJSVersion(raw);
  const result = Object.entries(modulesByVersions).flatMap(([version, modules]) => {
    return compare(version, '<=', corejs) ? modules : [];
  });
  return intersection(result, allModules);
}
