import {
  hasDocs, copyBlogPosts, copyBabelStandalone, copyCommonFiles, buildAndCopyCoreJS, buildWeb, getCurrentBranch,
} from './scripts/helpers.mjs';

const BUILD_SRC_DIR = './';
const BUNDLES_DIR = 'bundles';

try {
  console.time('Finished in');
  const targetBranch = await getCurrentBranch(BUILD_SRC_DIR);

  const version = { branch: targetBranch, label: targetBranch };
  await hasDocs(version, BUILD_SRC_DIR);
  await buildAndCopyCoreJS(version, false, BUILD_SRC_DIR, BUNDLES_DIR);

  await copyBabelStandalone(BUILD_SRC_DIR);
  await copyBlogPosts(BUILD_SRC_DIR);
  await copyCommonFiles(BUILD_SRC_DIR);
  await buildWeb(targetBranch, BUILD_SRC_DIR);
  console.timeEnd('Finished in');
} catch (error) {
  console.error(error);
}
