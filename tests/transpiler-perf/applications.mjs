import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Immutable upstream files, also used by the architecture corpus. Fetching and hashing
// happen before timing; no application dependencies or install scripts are executed.
export const APPLICATIONS = [
  {
    name: 'excalidraw utils, TypeScript application',
    repository: 'excalidraw/excalidraw',
    revision: '0dbd2a39319d41fda37b2945dea0dcbd58d6a564',
    filename: 'src/utils.ts', ts: true,
    sha256: '49d3088777d50ed33def6cf5a629a6ba49a6b26f00638b1837c3c683338a5a89',
  },
  {
    name: 'nodebb flags, CommonJS application',
    repository: 'NodeBB/NodeBB',
    revision: '8df838c054c25b5fc844e29c7644d8562ca7246b',
    filename: 'src/flags.js',
    sha256: 'a9d91560b3be6550777c02e510cfa7f91dff991081beac539127168437d1b127',
  },
  {
    name: 'squoosh compress, TSX application',
    repository: 'GoogleChromeLabs/squoosh',
    revision: '4768bc17ba7949e569753680eb5b90853d0c1ac3',
    filename: 'src/components/compress/index.tsx', ts: true, jsx: true, decorators: true,
    tsconfigRaw: { compilerOptions: { experimentalDecorators: true, jsxFactory: 'h', useDefineForClassFields: false } },
    sha256: '822b88371ed67aa19d796c35edf3803d00b3e6f6c9f7a2af2b35f8a7cb8d62dd',
  },
];

const CACHE = fileURLToPath(new URL('./node_modules/.cache/applications/', import.meta.url));

// Verify cached bytes too: a stale or damaged file must never silently change the workload.
export async function applicationSource({ repository, revision, filename, sha256 }) {
  const cached = `${ CACHE }${ sha256 }`;
  let bytes;
  let downloaded = false;
  try {
    bytes = await readFile(cached);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const url = `https://raw.githubusercontent.com/${ repository }/${ revision }/${ filename }`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Cannot fetch ${ url }: HTTP ${ response.status }`);
    bytes = Buffer.from(await response.arrayBuffer());
    downloaded = true;
  }
  if (createHash('sha256').update(bytes).digest('hex') !== sha256) {
    throw new Error(`Source checksum mismatch: ${ repository }/${ filename }`);
  }
  if (downloaded) {
    await mkdir(CACHE, { recursive: true });
    const temporary = `${ cached }.${ randomUUID() }.tmp`;
    try {
      await writeFile(temporary, bytes);
      await rename(temporary, cached);
    } finally {
      await rm(temporary, { force: true });
    }
  }
  return bytes.toString('utf8');
}
