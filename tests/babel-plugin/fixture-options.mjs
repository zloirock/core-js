// Read the same configuration in every fixture consumer, including collection.
import { access, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

// Function-bearing options take precedence; JSON retains fs-extra's BOM support.
export async function loadBabelOptions(directory) {
  for (const file of ['options.mjs', 'options.json']) {
    const full = join(directory, file);
    if (!await exists(full)) continue;
    // fs-extra's readJson (the lifted original) strips a BOM before parsing; JSON.parse throws on it
    if (file.endsWith('.json')) return JSON.parse((await readFile(full, 'utf8')).replace(/^\uFEFF/, ''));
    return (await import(pathToFileURL(resolve(full)).href)).default;
  }
  return null;
}

