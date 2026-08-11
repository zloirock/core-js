// Canonical-helper search over the plugin packages, the mechanical half of the
// "no new branch without canon check" rule: `find` opens with name/contract matches from the
// cached AST index, then probe text search over code and comments; `show` prints a found
// function whole; `dupes` / `contracts` enumerate the index.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { parse } from '@babel/parser';

const { cyan, green, red } = chalk;

// --- Constants ---

const PACKAGES = [
  'packages/core-js-babel-plugin',
  'packages/core-js-unplugin',
  'packages/core-js-polyfill-provider',
  'packages/core-js-compat',
];

const CACHE_DIR = path.join(os.homedir(), '.cache', 'core-js-canon');
// the cache is valid only when built by THIS exact extraction, and developers run different
// branches against one shared cache dir - so the hash of everything extraction depends on keys
// the cache file: the script itself (import.meta.url, not `__filename` - under the zxi bootstrap
// the global names the BOOTSTRAP script) plus the @babel/parser version (a caret dependency:
// installs diverge while the script hash stays put). no manual schema number, no collisions
const PARSER_VERSION = createRequire(import.meta.url)('@babel/parser/package.json').version;
const SCRIPT_HASH = createHash('sha256')
  .update(await fs.readFile(new URL(import.meta.url)))
  .update(PARSER_VERSION)
  .digest('hex')
  .slice(0, 12);
const INDEX_PATH = path.join(CACHE_DIR, `helpers-index-${ SCRIPT_HASH }.json`);

const FUNCTION_EXPRESSION_TYPES = new Set(['FunctionExpression', 'ArrowFunctionExpression']);
// every scope-opening function form - the NAME chain is not a scope proxy: private methods and
// anonymous callbacks carry no name, and their locals would leak into "module scope"
const SCOPE_NODE_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassMethod',
  'ClassPrivateMethod',
  'StaticBlock',
]);

const [command, ...rest] = argv._;
const asJSON = !!argv.json;

// --- File scan ---

async function scanFiles() {
  const files = await glob(PACKAGES.map(pkg => `${ pkg }/**/*.{js,mjs}`), { ignore: ['**/node_modules/**'] });
  const stats = await Promise.all(files.map(file => fs.stat(file)));
  return { files, maxMtimeMs: Math.max(...stats.map(entry => entry.mtimeMs)) };
}

// --- Index build ---

function tokenize(name) {
  return name
    .replace(/(?<lower>[0-9a-z])(?<upper>[A-Z])/gu, '$<lower> $<upper>')
    .replaceAll(/[$_]/gu, ' ')
    .toLowerCase()
    .split(/\s+/u)
    .filter(Boolean);
}

// prefix-tolerant name-token match: `resolver` finds `resolve*`; the 4-char floor keeps `re`
// inert, the length-gap cap keeps `name` off `namespace`
function tokensMatch(a, b) {
  return a === b
    || (a.length >= 4 && b.length >= 4 && Math.abs(a.length - b.length) <= 2
      && (a.startsWith(b) || b.startsWith(a)));
}

// coverage scoring over the AST index: each DISTINCT query word counts once - name match
// (weight 2, prefix-tolerant) over word-boundary contract match (weight 1); a multi-word query
// must cover 2+ words, so a lone `resolve` cannot flood the tail with every resolver
function scoreIndex(entries, query, cap) {
  const queryTokens = [...new Set(tokenize(query))];
  const needCoverage = Math.min(2, queryTokens.length);
  return entries
    .map(entry => {
      const contractWords = entry.contract ? new Set(entry.contract.toLowerCase().split(/[^0-9a-z]+/u)) : null;
      let score = 0;
      let coverage = 0;
      let exactLong = false;
      for (const token of queryTokens) {
        if (entry.tokens.some(name => tokensMatch(name, token))) {
          score += 2;
          coverage += 1;
          // an EXACT hit on a distinctive name token stands alone: contract-less helpers
          // (`semver`) must not need a second word to surface; scoring still ranks them below
          if (token.length >= 5 && entry.tokens.includes(token)) exactLong = true;
        } else if (contractWords?.has(token)) {
          score += 1;
          coverage += 1;
        }
      }
      return { entry, score, coverage, exactLong };
    })
    .filter(({ coverage, exactLong }) => coverage >= needCoverage || exactLong)
    .sort((a, b) => b.score - a.score || b.coverage - a.coverage)
    .slice(0, cap);
}

// transparent directive comments - they keep the adjacency walk going and never become the
// contract. spellings measured from the repo, not guessed: `eslint-*` (this corpus), `@ts-*`
// (TS checker, present in fixture inputs), `@dependency:` / `@types:` (core module directives,
// exact forms from scripts/build-entries-and-types/get-dependencies.mjs), `@type-options:`
// (d.ts sources), and the plugins' user-facing disable family - a manual mirror of the
// unexported DIRECTIVE canon in polyfill-provider/helpers/source-scan.js (a dev script must
// not add exports to a shipped package). prose contracts NAMING a directive stay: they start
// with a backtick, not with the directive itself
const DIRECTIVE_COMMENT = /^[\s*]*(?:eslint-|@ts-|@dependency: |@types: |@type-options:|core-js-disable-(?:file|line|next-line)(?:\s|$))/u;

// first line of the comment run that ends directly above the node - the contract by convention
function contractOf(comments, startLine) {
  if (!comments?.length) return null;
  const runOfComments = [];
  let expected = startLine - 1;
  for (let index = comments.length - 1; index >= 0; index--) {
    const comment = comments[index];
    if (comment.loc.end.line !== expected) break;
    if (!DIRECTIVE_COMMENT.test(comment.value)) runOfComments.unshift(comment);
    expected = comment.loc.start.line - 1;
  }
  const first = runOfComments[0]?.value.split('\n').map(line => line.replaceAll(/^[\s*]+/gu, '').trim()).find(Boolean);
  return first || null;
}

function collectExportedNames(body) {
  const names = new Set();
  for (const statement of body) {
    if (statement.type === 'ExportDefaultDeclaration') {
      if (statement.declaration?.id) names.add(statement.declaration.id.name);
      continue;
    }
    if (statement.type !== 'ExportNamedDeclaration') continue;
    const { declaration } = statement;
    if (declaration?.id) names.add(declaration.id.name);
    for (const declarator of declaration?.declarations ?? []) {
      if (declarator.id.type === 'Identifier') names.add(declarator.id.name);
    }
    for (const specifier of statement.specifiers) names.add(specifier.local?.name ?? specifier.exported.name);
  }
  return names;
}

function namedFunctionOf(node) {
  if (node.type === 'FunctionDeclaration' && node.id) return { name: node.id.name };
  if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.init && FUNCTION_EXPRESSION_TYPES.has(node.init.type)) {
    return { name: node.id.name };
  }
  if ((node.type === 'ObjectMethod' || node.type === 'ClassMethod') && !node.computed && node.key.type === 'Identifier') {
    return { name: node.key.name };
  }
  if (node.type === 'ObjectProperty' && !node.computed && node.key.type === 'Identifier' && node.value
    && FUNCTION_EXPRESSION_TYPES.has(node.value.type)) {
    return { name: node.key.name };
  }
  // module-scope data canon (`PRIMITIVE_HINTS`-style Sets / tables): the name and the comment
  // above it are searchable; the module-scope gate lives in `visit` - locals are noise
  if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.init) {
    return { name: node.id.name, data: true };
  }
  // standalone named function expression - argument position, named recursive IIFE
  if (node.type === 'FunctionExpression' && node.id) return { name: node.id.name };
  // `adapter.helper = function (...) {}` - the member key names the function
  if (node.type === 'AssignmentExpression' && node.operator === '=' && node.left.type === 'MemberExpression'
    && !node.left.computed && node.left.property.type === 'Identifier'
    && (FUNCTION_EXPRESSION_TYPES.has(node.right.type) && !node.right.id)) {
    return { name: node.left.property.name };
  }
  return null;
}

function indexSource({ source, file, entries }) {
  let ast;
  try {
    ast = parse(source, { sourceType: 'module', errorRecovery: true });
  } catch (error) {
    console.error(red(`parse failed: ${ file } - ${ error.message }`));
    return;
  }
  const exported = collectExportedNames(ast.program.body);
  // `inherited` forwards leading comments from export / variable-declaration wrappers one level down
  function visit(node, chain, inherited, fnDepth = 0) {
    if (Array.isArray(node)) {
      for (const item of node) visit(item, chain, inherited, fnDepth);
      return;
    }
    if (!node || typeof node.type !== 'string') return;
    const named = namedFunctionOf(node);
    if (named && (!named.data || fnDepth === 0)) {
      entries.push({
        name: named.name,
        file,
        line: node.loc.start.line,
        endLine: node.loc.end.line,
        parent: chain.join(' > ') || null,
        exported: fnDepth === 0 && exported.has(named.name),
        contract: contractOf(node.leadingComments ?? inherited, node.loc.start.line),
        tokens: tokenize(named.name),
        ...named.data ? { data: true } : {},
      });
    }
    const forwards = node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration'
      || node.type === 'VariableDeclaration' || node.type === 'ExpressionStatement';
    const nextChain = named && !named.data ? [...chain, named.name] : chain;
    const nextDepth = fnDepth + (SCOPE_NODE_TYPES.has(node.type) ? 1 : 0);
    for (const key of Object.keys(node)) {
      if (key === 'leadingComments' || key === 'trailingComments' || key === 'loc') continue;
      const value = node[key];
      if (value && typeof value === 'object') visit(value, nextChain, forwards ? node.leadingComments ?? inherited : undefined, nextDepth);
    }
  }
  visit(ast.program.body, [], undefined, 0);
}

// hash-keyed caches of dead branches / edited scripts accumulate - sweep the old ones in passing
async function pruneStaleCaches() {
  try {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    for (const name of await fs.readdir(CACHE_DIR)) {
      if (!/^helpers-index.*\.json(?:\.\d+\.tmp)?$/u.test(name) || INDEX_PATH.endsWith(name)) continue;
      const file = path.join(CACHE_DIR, name);
      if ((await fs.stat(file)).mtimeMs < cutoff) await fs.remove(file);
    }
  } catch { /* a cache sweep must never break the command */ }
}

async function loadIndex({ force = false } = {}) {
  const { files, maxMtimeMs } = await scanFiles();
  if (!force && await fs.pathExists(INDEX_PATH)) {
    try {
      const cached = await fs.readJson(INDEX_PATH);
      if (cached.fileCount === files.length && cached.maxMtimeMs >= maxMtimeMs) return cached;
    } catch { /* corrupt or concurrently half-written cache - fall through to a rebuild */ }
  }
  const started = Date.now();
  const entries = [];
  const sources = await Promise.all(files.map(async file => ({ file, source: await fs.readFile(file, 'utf8') })));
  for (const { file, source } of sources) indexSource({ source, file, entries });
  const index = { maxMtimeMs, fileCount: files.length, entries };
  // tmp + rename keeps a concurrent reader off a half-written cache
  const tmp = `${ INDEX_PATH }.${ process.pid }.tmp`;
  await fs.outputJson(tmp, index);
  await fs.rename(tmp, INDEX_PATH);
  await pruneStaleCaches();
  console.error(green(`index rebuilt: ${ cyan(entries.length) } entries from ${ cyan(files.length) } files in ${ cyan(Date.now() - started) } ms`));
  return index;
}

// --- Commands ---

// probe blocks can be mid-function fragments with no name in sight; the AST index knows the
// enclosing function - containment by [line, endLine], innermost (latest-starting) entry wins.
// nearest-preceding-start would misattribute after any closed nested sibling - half the corpus is nested
function buildFunctionLocator(entries) {
  const byFile = new Map();
  for (const entry of entries) {
    if (!byFile.has(entry.file)) byFile.set(entry.file, []);
    byFile.get(entry.file).push(entry);
  }
  return function locate(file, line) {
    let best = null;
    for (const entry of byFile.get(file) ?? []) {
      if (entry.line <= line && line <= entry.endLine && (!best || entry.line > best.line)) best = entry;
    }
    return best;
  };
}

// fragments of a body this long are matched by bulk, not by meaning - BM25 favours megafunctions
const GIANT_SPAN = 200;
// comment lines shown per result - lines 2-3 carry canon mentions, ten-line walls do not fit a scan
const COMMENT_CAP = 4;

// one row per LOCATED FUNCTION (probe may return several fragments of one body), with name +
// parent from the index and the leading comment capped at COMMENT_CAP lines; fragments of
// megafunction bodies collapse into one-line stubs at the section tail - their signature and
// comment describe the fragment, not the function; bodies stay behind --full
function renderCompact(results, locate) {
  const groups = new Map();
  for (const result of results) {
    const file = path.relative(process.cwd(), result.file);
    const codeLines = result.code.split('\n');
    const sigIndex = codeLines.findIndex(line => line.trim() && !/^\s*(?:\/\/|\/\*|\*)/u.test(line));
    // aim at the first CODE line: a whole-function block starts at its LEADING COMMENT, which sits
    // outside the function's own [line, endLine] and would mislocate the block into the enclosing factory
    const codeLine = result.lines[0] + Math.max(0, sigIndex);
    const entry = locate(file, codeLine);
    const key = `${ file }:${ entry ? entry.line : result.lines[0] }`;
    if (groups.has(key)) groups.get(key).matches += 1;
    else groups.set(key, { entry, file, result, matches: 1, codeLine, signature: (codeLines[sigIndex] ?? '').trim() });
  }
  const rows = [];
  const giants = [];
  for (const group of groups.values()) {
    const { entry, file, result, matches, codeLine, signature } = group;
    if (entry && codeLine > entry.line && entry.endLine - entry.line > GIANT_SPAN) {
      giants.push(group);
      continue;
    }
    const where = entry ? `${ cyan(entry.name) }${ entry.parent ? ` (in ${ entry.parent })` : '' }  ` : '';
    const suffix = matches > 1 ? `  [+${ matches - 1 } matches]` : '';
    if (entry && codeLine > entry.line) {
      // fragment of a located function: the index describes the function, the fragment's own
      // lines and comments describe an arbitrary spot inside it - render the index view
      rows.push(`${ where }${ file }:${ cyan(entry.line) }${ entry.contract ? `  - ${ entry.contract.slice(0, 120) }` : '' }${ suffix }`);
      continue;
    }
    rows.push(`${ where }${ file }:${ cyan(result.lines[0]) }  ${ signature.slice(0, 100) }${ suffix }`);
    const commentLines = [];
    for (const comment of result.leading_comments ?? []) {
      for (const line of comment.text.split('\n')) {
        const text = line.replaceAll(/^[\s*/]+|\*\/\s*$/gu, '').trim();
        if (text) commentLines.push(text);
      }
    }
    for (const text of commentLines.slice(0, COMMENT_CAP)) rows.push(`  ${ text.slice(0, 140) }`);
    if (commentLines.length > COMMENT_CAP) rows.push('  ...');
  }
  for (const { entry, file, result, matches } of giants) {
    rows.push(`${ cyan(entry.name) }  ${ file }:${ cyan(result.lines[0]) }  [${ matches } match(es) in a ${ entry.endLine - entry.line }-line body]`);
  }
  return rows.join('\n');
}

async function probeSearch({ query, pkg, limit, full, locate }) {
  // the ext filter keeps generated, gitignored artifacts out - probe does not respect .gitignore
  // here, and the compat package root holds multi-megabyte generated .json
  const filtered = `${ query } AND (ext:js OR ext:mjs)`;
  const format = full ? [] : ['--format', 'json'];
  const result = await $({ nothrow: true, quiet: true })`probe search ${ filtered } ${ pkg } --max-results ${ limit } ${ format }`;
  if (result.exitCode !== 0) return red(`probe failed on ${ pkg }: ${ result.stderr.trim() }`);
  if (full) {
    // drop the `Pattern: / Path: / Using ...` preamble up to the first block separator
    const cut = result.stdout.indexOf('---\n');
    return cut === -1 ? result.stdout : result.stdout.slice(cut + 4);
  }
  try {
    // parse from the first brace: on the first run after an install the probe wrapper
    // self-downloads its native binary and logs the progress to stdout AHEAD of the json
    const raw = result.stdout.slice(Math.max(0, result.stdout.indexOf('{')));
    // same coverage bar as the index leg: a multi-word query must match 2+ distinct terms
    // (probe stems them itself), else common domain words fill the tail with one-word hits;
    // compat data tables (`src/*.mjs` megaliterals) match any query by bulk and carry no code canon
    const need = Math.min(2, tokenize(query).length);
    const results = (JSON.parse(raw).results ?? [])
      .filter(entry => !/core-js-compat\/src\//u.test(entry.file))
      .filter(entry => (entry.matched_keywords?.length ?? need) >= need);
    return renderCompact(results, locate);
  } catch (error) {
    return red(`probe json failed on ${ pkg }: ${ error.message }`);
  }
}

async function commandFind(query) {
  const full = !!argv.full;
  const limit = argv.limit ?? (full ? 5 : 10);
  const index = await loadIndex();
  if (asJSON) {
    const scored = scoreIndex(index.entries, query, limit * PACKAGES.length);
    echo(JSON.stringify({ mode: 'index', results: scored.map(({ entry }) => entry) }));
    return;
  }
  // names and contracts are the strongest canon signal - they open the output, probe text search
  // follows; 12 slots because word-rich queries fill 8 with coverage-4 names and push the
  // coverage-3 canon out - score sorting leaves the extra slots empty on sparse queries
  const nameHits = scoreIndex(index.entries, query, 12);
  if (nameHits.length) {
    echo(green('== index: names and contracts =='));
    for (const { entry } of nameHits) {
      const where = entry.parent ? ` (in ${ entry.parent })` : '';
      echo(`${ cyan(entry.name) }${ where }  ${ entry.file }:${ cyan(entry.line) }${ entry.contract ? `  - ${ entry.contract.slice(0, 120) }` : '' }`);
    }
  }
  const locate = full ? null : buildFunctionLocator(index.entries);
  const sections = await Promise.all(PACKAGES.map(pkg => probeSearch({ query, pkg, limit, full, locate })));
  let printed = nameHits.length;
  for (const [at, pkg] of PACKAGES.entries()) {
    if (!sections[at].trim()) continue;
    echo(green(`== ${ pkg } ==`));
    echo(sections[at]);
    printed += 1;
  }
  if (!printed) echo('no matches');
  // a silent NAME block is the vocabulary-mismatch signal, whatever the text legs matched -
  // and this output is the one guaranteed documentation channel for a run-only consumer
  if (!nameHits.length) echo('hint: rephrase - name the entities involved and the operation on them; the canon may word it differently');
}

// `canon show file:line` - the follow-up read for a compact `find` row: prints the whole
// enclosing function via probe extract, no manual line-range guessing
async function commandShow(targets) {
  for (const target of targets) {
    const result = await $({ nothrow: true, quiet: true })`probe extract ${ target }`;
    // probe reports bad targets on stdout WITH exit 0 - a missing block header is the failure signal
    const cut = result.stdout.indexOf('File:');
    if (result.exitCode !== 0 || cut === -1) {
      const reason = (result.stderr || result.stdout).split('\n').find(line => line.includes('Error')) ?? 'no result';
      console.error(red(`probe extract failed on ${ target }: ${ reason.trim() }`));
      process.exitCode = 1;
      continue;
    }
    echo(result.stdout.slice(cut));
  }
}

async function commandDupes() {
  const min = argv.min ?? 2;
  const byName = new Map();
  for (const entry of (await loadIndex()).entries) {
    if (!byName.has(entry.name)) byName.set(entry.name, []);
    byName.get(entry.name).push(entry);
  }
  const dupes = [];
  for (const [name, entries] of byName) {
    const files = new Set(entries.map(entry => entry.file)).size;
    if (files >= min) dupes.push({ name, entries, files });
  }
  dupes.sort((a, b) => b.files - a.files || (a.name < b.name ? -1 : 1));
  if (asJSON) {
    echo(JSON.stringify(dupes));
    return;
  }
  for (const { name, entries, files } of dupes) {
    echo(`${ cyan(name) } - ${ cyan(files) } files`);
    for (const entry of entries) echo(`  ${ entry.file }:${ entry.line }${ entry.parent ? ` (in ${ entry.parent })` : '' }`);
  }
  echo(green(`${ dupes.length } names defined in ${ min }+ files`));
}

async function commandContracts() {
  // data tables are not doc-debt - the backfill queue stays functions-only
  const missing = (await loadIndex()).entries.filter(entry => entry.exported && !entry.contract && !entry.data);
  if (asJSON) {
    echo(JSON.stringify(missing));
    return;
  }
  for (const entry of missing) echo(`${ cyan(entry.name) } ${ entry.file }:${ entry.line }`);
  echo(green(`${ missing.length } exported functions without a contract line`));
}

// --- Entry ---

switch (command) {
  case 'find': {
    const query = rest.join(' ').trim();
    if (query) await commandFind(query);
    else {
      console.error(red('usage: canon find "<behavior words>" [--limit N] [--full] [--json]'));
      process.exitCode = 1;
    }
    break;
  }
  case 'show':
    if (rest.length) await commandShow(rest);
    else {
      console.error(red('usage: canon show <file:line> [<file:line> ...]'));
      process.exitCode = 1;
    }
    break;
  case 'dupes':
    await commandDupes();
    break;
  case 'contracts':
    await commandContracts();
    break;
  case 'reindex':
    await loadIndex({ force: true });
    break;
  default:
    console.error(red('usage: canon find "<words>" [--full] | show <file:line> | dupes [--min N] | contracts | reindex  [--json]'));
    process.exitCode = 1;
}
