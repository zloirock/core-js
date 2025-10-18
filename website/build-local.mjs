import {
  isExists, copyBlogPosts, copyBabelStandalone, copyCommonFiles, buildWeb, getCurrentBranch, buildAndCopyCoreJS,
} from './scripts/helpers.mjs';
import { join } from 'node:path';

const BUILD_SRC_DIR = './';
const BUNDLES_DIR = 'bundles';

async function hasDocsLocal(srcDir) {
  const target = join(srcDir, 'docs/web/docs');
  console.log(`Checking if docs exist in "${ target }"...`);
  if (!await isExists(target)) {
    throw new Error(`Docs not found in "${ target }".`);
  }
}

try {
  console.time('Finished in');
  const targetBranch = await getCurrentBranch(BUILD_SRC_DIR);

  const version = { branch: targetBranch, label: targetBranch };
  await hasDocsLocal(BUILD_SRC_DIR);
  await buildAndCopyCoreJS(version, BUILD_SRC_DIR, BUNDLES_DIR);

  await copyBabelStandalone(BUILD_SRC_DIR);
  await copyBlogPosts(BUILD_SRC_DIR);
  await copyCommonFiles(BUILD_SRC_DIR);
  await buildWeb(targetBranch, BUILD_SRC_DIR, true);
  console.timeEnd('Finished in');
} catch (error) {
  console.error(error);
}
