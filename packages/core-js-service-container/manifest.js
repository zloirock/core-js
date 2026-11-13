import { readFile } from 'node:fs/promises';
import compatData from '@core-js/compat/data' with { type: 'json' };

const knownModules = new Set(Object.keys(compatData));

export async function loadManifest(path) {
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest) ||
    Object.keys(manifest).length !== 1 || !Array.isArray(manifest.modules)) {
    throw new TypeError('manifest must contain only a modules array');
  }

  for (const module of manifest.modules) {
    if (typeof module !== 'string' || !knownModules.has(module)) {
      throw new TypeError(`unknown manifest module: ${ String(module) }`);
    }
  }

  return [...new Set(manifest.modules)];
}
