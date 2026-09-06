// Removing an entry statement must never PROMOTE a following string literal into the directive
// prologue. `"use strict"` two statements down is an ordinary expression until everything above it
// goes away; the moment it leads the body it changes the strictness of the whole file, silently and
// at runtime. The guard that prevents it is unconditional, so the shapes are enumerated rather than
// sampled: what stands before the removed entry, what stands after it, and how many removals run
// together. The last check is what gives the rest their meaning - the pass has to be REMOVING
// something, or nothing was ever at risk.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@8 (default)
// and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { parseSync } from 'oxc-parser';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformSync } = requireBabel('@babel/core');

const { check, checkTruthy, finish } = createChecker('entry-directive-promotion');

const ENTRY = 'import "core-js/es/array/from";';
const ENTRY2 = 'import "core-js/es/array/at";';
// the minifier-joined entry spelling, kept in a name of its own: the row that uses it needs both
// quote flavors in one literal
const SEQ_ENTRY = "(0, require)('core-js/es/array/from'), g();";
const OPTIONS = { method: 'entry-global', version: '4.0', targets: { chrome: 130 } };

// a leading run of string-literal expression statements IS the prologue, whatever the parser calls
// it - asked of the PRINTED output, because that is what the next tool reads
function prologue(code) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const { program } = parseSync('/p.js', code, { lang: 'jsx', sourceType: 'module' });
  const out = [];
  for (const node of program.body) {
    if (node.type !== 'ExpressionStatement' || node.expression?.type !== 'Literal'
      || typeof node.expression.value !== 'string') break;
    out.push(node.expression.value);
  }
  return out;
}

function transform(code) {
  // eslint-disable-next-line node/no-sync -- the prologue compare is synchronous, and so is this
  return transformSync(code, {
    filename: '/p.js',
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    plugins: [['../../packages/core-js-babel-plugin/index.js', OPTIONS]],
  })?.code ?? code;
}

const ROWS = [
  ['bare literal after one entry', `${ ENTRY }\n"use strict";\nf();`],
  ['bare literal after two entries', `${ ENTRY }\n${ ENTRY2 }\n"use strict";\nf();`],
  ['bare literal after a real directive and an entry', `"use asm";\n${ ENTRY }\n"use strict";\nf();`],
  ['two bare literals after an entry', `${ ENTRY }\n"a";\n"b";\nf();`],
  ['literal after an entry with a statement between', `${ ENTRY }\ng();\n"use strict";\nf();`],
  ['literal first, entry after it', `"use strict";\n${ ENTRY }\nf();`],
  ['entry between two literals', `"use asm";\n${ ENTRY }\n"use strict";\ng();`],
  ['entry last, nothing after', `${ ENTRY }\nf();`],
  ['only an entry and a literal', `${ ENTRY }\n"use strict";`],
  ['entry inside a sequence, literal after', `${ SEQ_ENTRY }\n"use strict";\nf();`],
];

let changed = 0;
for (const [label, source] of ROWS) {
  const output = transform(source);
  if (output !== source) changed++;
  const before = prologue(source);
  const promoted = prologue(output).filter(value => !before.includes(value));
  check(`promotion/${ label }`, promoted.join(' '), '');
}
checkTruthy('promotion/control - every row actually had an entry removed', changed === ROWS.length);

finish();
