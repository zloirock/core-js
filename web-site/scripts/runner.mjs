import childProcess from 'node:child_process';
import fs from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const exec = promisify(childProcess.exec);
const { cp, readdir } = fs;

const srcDir = 'core-js';
const buildsRootDir = 'builds';
const buildResultDir = 'result';
const repo = 'https://github.com/zloirock/core-js.git';
const builderBranch = 'web';
const defaultVersion = 'web';

const args = process.argv;
const lastArg = args.at(-1);
const branch = lastArg.startsWith('branch=') ? lastArg.slice('branch='.length) : undefined;

const buildId = new Date().toISOString().replaceAll(/\D/g, '-') + Math.random().toString(36).slice(2, 8);

const buildDir = `${ buildsRootDir }/${ buildId }/`;
const buildSrcDir = `${ buildDir }${ srcDir }/`;
const builderDocsDir = `${ buildDir }builder/`;
const siteFilesDir = `${ buildDir }${ srcDir }/web/dist/`;

async function getTagsWithSiteDocs() {
  console.log('Getting tags with site docs...');
  console.time('Got tags with site docs');
  // const tagsString = await exec(
  //   `git tag --list | sort -V | while read t; do v=\${t#v}; IFS=. read -r M m p <<< "$v"; m=\${m:-0}; `
  //   + `if { [ "$M" -gt 3 ] || { [ "$M" -eq 3 ] && [ "$m" -gt 40 ]; }; }; `
  //   + `then git ls-tree -r --name-only "$t" | grep --qxF "web-site/scripts/build.mjs" && echo "$t"; fi; done`,
  //   { cwd: buildSrcDir }
  // );
  const tagsString = await exec(
    'git branch --remote --format="%(refname:short)" | while read branch; do if git ls-tree -r --name-only "$branch" | '
    + 'grep -q "docs/web/docs/"; then echo "$branch"; fi; done',
    { cwd: buildSrcDir },
  );
  const tags = tagsString.stdout.split('\n').filter(tag => tag !== '')
    .map(name => name.replace('origin/', ''));
  console.timeEnd('Got tags with site docs');
  console.log(`Found tags with site docs: ${ tags.join(', ') }`);
  return tags;
}

async function buildWeb() {
  console.log('Building web');
  console.time('Built web');
  let command = 'npm run build-web';
  if (branch) command += ` branch=${ branch }`;
  const stdout = await exec(command, { cwd: buildSrcDir });
  console.timeEnd('Built web');
  return stdout;
}

async function copyWeb() {
  console.log('Copying web...');
  console.time('Copied web');
  const toDir = `${ buildDir }${ buildResultDir }/`;
  await cp(siteFilesDir, toDir, { recursive: true });
  console.timeEnd('Copied web');
}

async function createBuildDir() {
  console.log(`Creating build directory "${ buildDir }"`);
  console.time(`Created build directory ${ buildDir }`);
  await exec(`mkdir -p ${ buildDir }`);
  await exec(`mkdir -p ${ builderDocsDir }`);
  console.timeEnd(`Created build directory ${ buildDir }`);
}

async function installDependencies() {
  console.log('Installing dependencies...');
  console.time('Installed dependencies');
  await exec('npm ci', { cwd: buildSrcDir });
  await exec('npm ci', { cwd: `${ buildSrcDir }web-site/` });
  console.timeEnd('Installed dependencies');
}

async function cloneRepo() {
  console.log('Cloning core-js repository...');
  console.time('Cloned core-js repository');
  await exec(`git clone ${ repo } ${ srcDir }`, { cwd: buildDir });
  console.timeEnd('Cloned core-js repository');
}

async function switchToLatestBuild() {
  console.log('Switching to the latest build...');
  console.time('Switched to the latest build');
  const absoluteBuildPath = path.resolve(`${ buildDir }${ buildResultDir }`);
  const absoluteLatestPath = path.resolve('./latest');
  console.log(absoluteBuildPath, absoluteLatestPath);
  await exec('rm -f ./latest');
  await exec(`ln -sf ${ absoluteBuildPath } ${ absoluteLatestPath }`);
  console.timeEnd('Switched to the latest build');
}

async function clearBuildDir() {
  console.log(`Clearing build directory "${ buildSrcDir }"`);
  console.time(`Cleared build directories ${ buildSrcDir } and ${ builderDocsDir }`);
  await exec(`rm -rf ${ buildSrcDir }`);
  await exec(`rm -rf ${ builderDocsDir }`);
  console.timeEnd(`Cleared build directories ${ buildSrcDir } and ${ builderDocsDir }`);
}

async function copyDocs(from, to, recursive = true) {
  console.log(`Copying docs from "${ from }" to "${ to }"`);
  console.time(`Copied docs from "${ from }" to "${ to }"`);
  await cp(from, to, { recursive });
  console.timeEnd(`Copied docs from "${ from }" to "${ to }"`);
}

async function copyDocsToBuilder(name) {
  console.log(`Copying docs to builder for branch/tag "${ name }"`);
  console.time(`Copied docs to builder for branch/tag "${ name }"`);
  await exec(`git checkout origin/${ name }`, { cwd: buildSrcDir });
  // await exec(`git checkout ${name}`, { cwd: buildSrcDir });  // uncomment for tags and comment the line above
  const fromDir = `${ buildSrcDir }docs/web/docs/`;
  const toDir = `${ builderDocsDir }${ name }/docs/`;
  await copyDocs(fromDir, toDir);
  console.timeEnd(`Copied docs to builder for branch/tag "${ name }"`);
}

async function copyBuilderDocs() {
  console.log('Copying builder docs...');
  console.time('Copied builder docs');
  const fromDir = `${ builderDocsDir }`;
  const toDir = `${ buildSrcDir }docs/web/`;
  await copyDocs(fromDir, toDir);
  console.timeEnd('Copied builder docs');
}

async function prepareBuilder(targetBranch) {
  console.log('Preparing builder...');
  console.time('Prepared builder');
  await exec(`git checkout origin/${ targetBranch }`, { cwd: buildSrcDir });
  await installDependencies();
  if (!branch) await exec(`rm -rf ${ buildSrcDir }docs/web/docs/`);
  console.timeEnd('Prepared builder');
}

async function hasDocsInBranch(name) {
  console.log(`Checking if docs exist in the branch "${ name }"...`);
  try {
    await exec(`git ls-tree -r --name-only origin/${ name } | grep "docs/web/docs/"`, { cwd: buildSrcDir });
  } catch {
    throw new Error(`No docs found in the branch "${ name }".`);
  }
}

async function switchBranchToLatestBuild(name) {
  console.log(`Switching branch "${ name }" to the latest build...`);
  console.time(`Switched branch "${ name }" to the latest build`);
  const absoluteBuildPath = path.resolve(`${ buildDir }${ buildResultDir }`);
  const absoluteLatestPath = path.resolve(`./branches/${ name }`);
  await exec(`rm -f ./branches/${ name }`);
  await exec(`ln -sf ${ absoluteBuildPath } ${ absoluteLatestPath }`);
  console.timeEnd(`Switched branch "${ name }" to the latest build`);
}

async function buildAndCopyCoreJS() {
  console.log('Building and copying core-js...');
  console.time('Core JS bundle built');
  await exec('npm run bundle-package', { cwd: buildSrcDir });
  const bundlePath = `${ buildSrcDir }packages/core-js-bundle/minified.js`;
  const destPath = `${ buildSrcDir }web-site/src/public/core-js-bundle.js`;
  await cp(bundlePath, destPath, { });
  console.timeEnd('Core JS bundle built');
}

async function getExcludedBuilds() {
  const branchBuilds = await readdir('./branches/');
  const excluded = new Set();
  for (const name of branchBuilds) {
    const link = await fs.readlink(`./branches/${ name }`);
    if (!link) continue;
    const parts = link.split('/');
    const id = parts.at(-2);
    excluded.add(id);
  }
  const latestBuildLink = await fs.readlink('./latest');
  if (latestBuildLink) {
    const parts = latestBuildLink.split('/');
    const id = parts.at(-2);
    excluded.add(id);
  }

  return Array.from(excluded);
}

async function clearOldBuilds() {
  console.log('Clearing old builds...');
  console.time('Cleared old builds');
  const excluded = await getExcludedBuilds();
  const builds = await readdir(buildsRootDir);
  for (const build of builds) {
    if (!excluded.includes(build)) {
      await exec(`rm -rf ${ path.join('./', buildsRootDir, '/', build) }`);
      console.log(`Build removed: "${ path.join('./', buildsRootDir, '/', build) }"`);
    }
  }
  console.timeEnd('Cleared old builds');
}

async function copyBlogPosts() {
  console.log('Copying blog posts...');
  console.time('Copied blog posts');
  const fromDir = `${ buildSrcDir }docs/`;
  const toDir = `${ buildSrcDir }docs/web/blog/`;
  const entries = await readdir(fromDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      const srcFile = path.join(fromDir, entry.name);
      const destFile = path.join(toDir, entry.name);
      await fs.copyFile(srcFile, destFile);
    }
  }
  console.timeEnd('Copied blog posts');
}

async function copyCommonFiles() {
  console.log('Copying common files...');
  console.time('Copied common files');
  const fromDir = `${ buildSrcDir }`;
  const toDir = `${ buildSrcDir }docs/web/`;
  await fs.copyFile(`${ fromDir }CHANGELOG.md`, `${ toDir }changelog.md`);
  await fs.copyFile(`${ fromDir }CONTRIBUTING.md`, `${ toDir }contributing.md`);
  await fs.copyFile(`${ fromDir }SECURITY.md`, `${ toDir }security.md`);
  console.timeEnd('Copied common files');
}

async function createLastDocsLink() {
  console.log('Creating last docs link...');
  console.time('Created last docs link');
  const absoluteBuildPath = path.resolve(`${ buildDir }${ buildResultDir }/${ defaultVersion }/docs/`);
  const absoluteLastDocsPath = path.resolve(`${ buildDir }${ buildResultDir }/docs/`);
  await exec(`ln -s ${ absoluteBuildPath } ${ absoluteLastDocsPath }`);
  console.timeEnd('Created last docs link');
}

async function run() {
  console.time('Finished in');
  await createBuildDir();
  await cloneRepo();

  const targetBranch = branch || builderBranch;
  if (!branch) {
    const tags = await getTagsWithSiteDocs();
    if (tags.length) {
      for (const tag of tags) {
        await copyDocsToBuilder(tag);
      }
    }
  } else {
    await hasDocsInBranch(targetBranch);
  }

  await prepareBuilder(targetBranch);
  await buildAndCopyCoreJS();
  await copyBlogPosts();
  await copyCommonFiles();
  if (!branch) {
    await copyBuilderDocs();
  }
  await buildWeb();

  await copyWeb();
  await createLastDocsLink();

  if (!branch) {
    await switchToLatestBuild();
  } else {
    await switchBranchToLatestBuild(targetBranch);
  }
  await clearBuildDir();
  await clearOldBuilds();
  console.timeEnd('Finished in');
}

await run().catch(console.error);
