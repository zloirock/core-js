import { mkdir, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';

// Isolated test modules live under this workspace to resolve its dependencies.
export async function createTestDirectory(prefix) {
  const root = join(import.meta.dirname, 'tmp');
  await mkdir(root, { recursive: true });
  return mkdtemp(join(root, prefix));
}
