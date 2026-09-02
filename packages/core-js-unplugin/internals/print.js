import { print } from 'esrap';
import ts, { EXPRESSIONS_PRECEDENCE } from 'esrap/languages/ts';
import tsx from 'esrap/languages/tsx';
import { stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';
import { buildOffsetToLoc } from '@core-js/polyfill-provider/helpers/source-scan';
import { TRANSPARENT_EXPR_WRAPPER_TYPES } from '@core-js/polyfill-provider/helpers/ast-patterns';

// TS postfix `!` binds at member/call level - `x?.a!.b` CONTINUES the optional chain -
// but the upstream table ranks it below MemberExpression, so a member over a non-null
// gets wrapped and `(x?.a!).b` TERMINATES the chain: a nullish root then throws instead
// of short-circuiting. one-row patch on the shared table (tsx rides the same one)
EXPRESSIONS_PRECEDENCE.TSNonNullExpression = EXPRESSIONS_PRECEDENCE.MemberExpression;

// the esrap printer adapter: oxc-parser hands out offsets, esrap attaches comments and
// emits sourcemap segments by `loc` - this module synthesizes the locs and owns the
// esrap-facing quirks (hashbang, EOF flush strictness, map field contract). the caller
// passes BOM-free source - the plugin strips the BOM before parsing, and the output stays
// BOM-free (babel alignment; `sourcesContent` alone keeps the original bytes)

// the parse keeps `preserveParens` for detection, but the PRINT normalizes parens to the
// minimal structural set, exactly like the babel leg: esrap re-derives every required paren
// from precedence, and a kept `ParenthesizedExpression` would get wrapped a second time by
// that same machinery - each reprint then grows a layer (`((0, require))(...)`) and
// idempotency dies. the parens esrap cannot re-derive are the ones that KEEP semantics away -
// the three hosts named below, a paren-wrapped string at statement position the first: it is NOT
// a directive, so one layer stays or the reprint would promote it into the directive prologue
function peelParens(child, parent, commentBetween) {
  if (!child || child.type !== 'ParenthesizedExpression') return child;
  let inner = child.expression;
  while (inner.type === 'ParenthesizedExpression') inner = inner.expression;
  // three hosts where the paren IS the grammar and esrap cannot re-derive it: a paren-wrapped
  // string at statement position is NOT a directive, a decorator admits only a
  // LeftHandSideExpression bare (`@(<Map />)` reparses as garbage without its parens), and a
  // comment between `throw` / `yield` and the operand they forbid a line terminator before
  // flushes onto the keyword's line and pushes the operand under it - `throw // note` is
  // `throw;` (esrap guards `return` this way itself, not these two) - keep exactly one layer
  if (parent?.type === 'Decorator'
    || (parent?.type === 'ExpressionStatement' && inner.type === 'Literal' && typeof inner.value === 'string')) {
    child.expression = inner;
    return child;
  }
  if ((parent?.type === 'ThrowStatement' || parent?.type === 'YieldExpression') && commentBetween(child, inner)) {
    child.expression = inner;
    child.commentInside = true;
    return child;
  }
  return inner;
}

// the synthetic paren node the gap overrides hand to a base printer to restore grouping
function parenthesize(expression) {
  return { type: 'ParenthesizedExpression', expression, loc: expression.loc };
}

// esrap 2.3.5 gaps, measured by the roundtrip gate over the fixture corpus; every override
// carries its reproducing shape and dies as upstream catches up
function withCorpusGapOverrides(language) {
  const baseImport = language.ImportDeclaration;
  // `import type {} from 'x'` prints as the VALUE import `import 'x'` - a type-only entry
  // erases at runtime while the value spelling is a live side-effect entry
  language.ImportDeclaration = (node, context) => {
    if (node.importKind === 'type' && node.specifiers?.length === 0) {
      context.write('import type {} from ');
      context.visit(node.source);
      context.write(';');
    } else baseImport(node, context);
  };
  // a concise arrow body whose LEFT EDGE is an object literal needs parens: bare, that `{`
  // opens a BLOCK body and `() => ({ a: 1 } || x)` re-parses as a labelled statement. esrap
  // wraps only when the object IS the whole body, and the synth mirror plants literals at
  // exactly that edge inside a larger expression
  function startsWithObjectLiteral(node) {
    for (let cur = node; cur && typeof cur.type === 'string';) {
      switch (cur.type) {
        case 'ObjectExpression': return true;
        case 'BinaryExpression': case 'LogicalExpression': case 'AssignmentExpression': cur = cur.left; break;
        case 'MemberExpression': cur = cur.object; break;
        case 'CallExpression': case 'NewExpression': cur = cur.callee; break;
        case 'ConditionalExpression': cur = cur.test; break;
        case 'SequenceExpression': [cur] = cur.expressions; break;
        case 'TaggedTemplateExpression': cur = cur.tag; break;
        case 'ChainExpression': case 'TSAsExpression': case 'TSSatisfiesExpression':
        case 'TSNonNullExpression': cur = cur.expression; break;
        default: return false;
      }
    }
    return false;
  }
  const baseArrow = language.ArrowFunctionExpression;
  language.ArrowFunctionExpression = (node, context) => {
    if (node.body?.type === 'BlockStatement' || node.body?.type === 'ObjectExpression'
      || !startsWithObjectLiteral(node.body)) return baseArrow(node, context);
    baseArrow({ ...node, body: parenthesize(node.body) }, context);
  };
  // `(M.g as any)<any>` prints as `M.g as any<any>` - no precedence row for the
  // instantiation base; a synthetic paren node restores the grouping
  const BARE_INSTANTIATION_BASES = new Set(['Identifier', 'MemberExpression', 'CallExpression', 'ThisExpression', 'Super']);
  const baseInstantiation = language.TSInstantiationExpression;
  language.TSInstantiationExpression = (node, context) => {
    if (BARE_INSTANTIATION_BASES.has(node.expression.type)) return baseInstantiation(node, context);
    baseInstantiation({ ...node, expression: parenthesize(node.expression) }, context);
  };
  // esrap prints a destructuring pattern's annotation (2.3.6; <= 2.3.5 forgot ArrayPattern's)
  // but never its `?` (a declare-signature `([a]?: T[])` / `({ a }?: O)` param; Identifier
  // carries its own upstream). strip both from what the base sees and print them ourselves,
  // in source order - correct on either esrap side, and the tree stays unmutated
  for (const type of ['ArrayPattern', 'ObjectPattern']) {
    const basePattern = language[type];
    language[type] = (node, context) => {
      if (!node.typeAnnotation && !node.optional) return basePattern(node, context);
      const { typeAnnotation, optional, ...bare } = node;
      basePattern(bare, context);
      if (optional) context.write('?');
      if (typeAnnotation) context.visit(typeAnnotation);
    };
  }
  // `` `${string}_sfx` `` drops every quasi - only the substitutions survive
  language.TSTemplateLiteralType = (node, context) => {
    context.write(`\`${ node.quasis[0].value.raw }`);
    for (let i = 0; i < node.types.length; i++) {
      context.write('${');
      context.visit(node.types[i]);
      context.write(`}${ node.quasis[i + 1].value.raw }`);
    }
    context.write('`');
  };
  // not implemented upstream: the JSDoc-style `?T` / `T?` annotation oxc admits in TS
  language.TSJSDocNullableType = (node, context) => {
    if (node.postfix) {
      context.visit(node.typeAnnotation);
      context.write('?');
    } else {
      context.write('?');
      context.visit(node.typeAnnotation);
    }
  };
  // oxc spells the import source `source` where the handler expects ts-eslint's `argument`
  const baseImportType = language.TSImportType;
  language.TSImportType = (node, context) => baseImportType({ ...node, argument: node.source }, context);
  // oxc hangs a method's type parameters on its VALUE function; the class-method printers
  // read them off the method node itself (the ts-eslint shape). the clone keeps the tree
  // unmutated - the roundtrip gate compares it against a reparse
  for (const methodType of ['MethodDefinition', 'TSAbstractMethodDefinition']) {
    const baseMethod = language[methodType];
    language[methodType] = (node, context) => {
      if (!node.typeParameters && node.value?.typeParameters) {
        return baseMethod({ ...node, typeParameters: node.value.typeParameters }, context);
      }
      baseMethod(node, context);
    };
  }
  // an object-literal concise method never prints its type parameters at all - the Property
  // branch writes `key(` directly, consulting neither node. a synthetic key node smuggles
  // them in after the key; the computed spelling has no seam between `]` and `(`, so it
  // degrades to the equivalent function-expression property (a body leaning on `super`
  // then fails the reparse LOUDLY - never a silent type drop)
  language.CoreJSMethodKeyTypeParameters = (node, context) => {
    context.visit(node.key);
    context.visit(node.typeParameters);
  };
  const baseProperty = language.Property;
  language.Property = (node, context) => {
    // esrap collapses `x: x` to shorthand on NAME equality alone, ignoring the parsed
    // `shorthand: false` - on an ES5-target reprint (the post side of the e2e sandwich,
    // where the input is already lowered) that rewrites the author's longhand back into
    // ES2015 syntax. spell the longhand the flag records
    const collapseTarget = node.value?.type === 'AssignmentPattern' ? node.value.left : node.value;
    if (!node.shorthand && !node.computed && !node.method && node.kind === 'init'
      && node.key?.type === 'Identifier' && collapseTarget?.type === 'Identifier'
      && node.key.name === collapseTarget.name) {
      context.visit(node.key);
      context.write(': ');
      context.visit(node.value);
      return;
    }
    const typeParameters = node.value?.typeParameters;
    if (!typeParameters || !node.method || node.value.type !== 'FunctionExpression') return baseProperty(node, context);
    if (!node.computed) {
      return baseProperty({ ...node, key: { type: 'CoreJSMethodKeyTypeParameters', key: node.key, typeParameters } }, context);
    }
    baseProperty({ ...node, method: false }, context);
  };
  // explicit type arguments on a tagged template (`tag<Set<number>>` `x``) are dropped
  const baseTagged = language.TaggedTemplateExpression;
  language.TaggedTemplateExpression = (node, context) => {
    if (!node.typeArguments) return baseTagged(node, context);
    const wrap = (EXPRESSIONS_PRECEDENCE[node.tag.type] ?? 0) < EXPRESSIONS_PRECEDENCE.CallExpression;
    if (wrap) context.write('(');
    context.visit(node.tag);
    if (wrap) context.write(')');
    context.visit(node.typeArguments);
    context.visit(node.quasi);
  };
  // a ChainExpression under postfix `!` is SEALED and only parens spell that boundary:
  // `(a?.b)!.c` printed bare re-parses as one continuous chain and short-circuits past
  // the assertion. the member/call printers know this about chains; the non-null one does not
  const baseNonNull = language.TSNonNullExpression;
  language.TSNonNullExpression = (node, context) => {
    if (node.expression.type !== 'ChainExpression') return baseNonNull(node, context);
    baseNonNull({ ...node, expression: parenthesize(node.expression) }, context);
  };
  // a bare cast is not a valid assignment TARGET in the real TS grammar - `w as any = [1]`
  // fails on tsc/babel even though oxc admits it; restore the parens the peel removed.
  // destructure property targets, for-x heads and `w! =` are all legal bare (measured)
  const WRAPPED_ASSIGN_TARGETS = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSTypeAssertion']);
  const baseAssignment = language.AssignmentExpression;
  language.AssignmentExpression = (node, context) => {
    if (!WRAPPED_ASSIGN_TARGETS.has(node.left.type)) return baseAssignment(node, context);
    baseAssignment({ ...node, left: parenthesize(node.left) }, context);
  };
  // the one paren layer the peel keeps around a commented `throw` / `yield` operand opens its
  // operand on a fresh line, the way the author wrote it: esrap flushes the comment right after
  // the `(` otherwise, and a line-bound directive that leaves its own line is what the roundtrip
  // gate holds against. every other kept layer (the decorator, the string statement) has no
  // comment inside and prints inline
  const baseParenthesized = language.ParenthesizedExpression;
  language.ParenthesizedExpression = (node, context) => {
    if (!node.commentInside) return baseParenthesized(node, context);
    context.write('(');
    context.indent();
    context.newline();
    context.visit(node.expression);
    context.dedent();
    context.newline();
    context.write(')');
  };
  // an update over a compound operand prints unwrapped - `Map as any++` does not reparse
  const baseUpdate = language.UpdateExpression;
  language.UpdateExpression = (node, context) => {
    if ((EXPRESSIONS_PRECEDENCE[node.argument.type] ?? 0) >= EXPRESSIONS_PRECEDENCE.UpdateExpression) return baseUpdate(node, context);
    baseUpdate({ ...node, argument: parenthesize(node.argument) }, context);
  };
  // parameter decorators (`constructor(@inject(...) foo: string)`) are dropped - no param
  // printer consults `node.decorators`. the prelude wrapper composes over the annotation
  // wrapper above, and the length check keeps every non-param position (oxc hangs an empty
  // `decorators` array on each of these node types) on the base path
  for (const paramType of ['Identifier', 'AssignmentPattern', 'ArrayPattern', 'ObjectPattern', 'RestElement', 'TSParameterProperty']) {
    const baseParam = language[paramType];
    if (!baseParam) continue;
    language[paramType] = (node, context) => {
      if (node.decorators?.length) {
        for (const decorator of node.decorators) {
          context.visit(decorator);
          context.write(' ');
        }
      }
      baseParam(node, context);
    };
  }
  return language;
}

// walk the tree setting `node.loc` from the offsets; returns loc-carrying copies of the
// comments. `loc` values are skipped on re-entry via the `loc` key itself never carrying
// a `type`. mutating the parsed program is deliberate - the parse is transform-local
function synthesizeLocs(program, comments, source) {
  // does a comment open inside `outer`'s span ahead of `inner`'s start? asked only of the two
  // line-terminator-sensitive paren hosts. the comment list is source-ordered and its members do not
  // overlap, so the first comment opening at or after `outer` is the only candidate: every later
  // one closes later too, and a file dense in such hosts pays a binary search per host, not a scan
  function commentBetween(outer, inner) {
    if (typeof outer.start !== 'number' || typeof inner.start !== 'number') return false;
    let lo = 0;
    let hi = comments.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (comments[mid].start < outer.start) lo = mid + 1;
      else hi = mid;
    }
    return lo < comments.length && comments[lo].end <= inner.start;
  }
  const locate = buildOffsetToLoc(source);
  let hasChainExpression = false;
  (function walk(node, anchor) {
    if (Array.isArray(node)) {
      for (const item of node) walk(item, anchor);
      return;
    }
    if (!node || typeof node !== 'object') return;
    // the flag feeds the dead-chain gate, and a SYNTHESIZED chain (no source positions,
    // so the loc branch below never sees it) must arm it too
    if (node.type === 'ChainExpression') hasChainExpression = true;
    if (typeof node.type === 'string') {
      if (typeof node.start === 'number' && typeof node.end === 'number') {
        node.loc = { start: locate(node.start), end: locate(node.end) };
        anchor = node.loc;
      } else if (node.replacedSpan) {
        // a drain REPLACEMENT carries the replaced host's span in the side channel - it maps
        // (and anchors its minted innards) exactly where the host stood
        node.loc = { start: locate(node.replacedSpan.start), end: locate(node.replacedSpan.end) };
        anchor = node.loc;
      } else if (/(?:Declaration|Statement)$/.test(node.type)) {
        // an INJECTED statement is fully synthetic - nothing under it derives from a user
        // region, and its own loc would drive esrap's blank-line margins besides
        anchor = null;
      } else if (anchor) {
        // a SYNTHESIZED expression stands where the node it replaced stood: map it to the
        // nearest positioned ancestor's START, the way a text splice keeps the spelled
        // bytes mapped - without this a file whose every mapped token was rewritten (a bare
        // `globalThis;`) prints a VACUOUS map. a zero-width point, not the region: esrap
        // also reads loc SPANS for line-break decisions, and a borrowed span must not
        // reformat the minted spelling
        node.loc = { start: anchor.start, end: anchor.start };
      }
    }
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      if (key === 'loc' || key === 'replacedSpan') continue;
      const value = node[key];
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) value[i] = peelParens(value[i], node, commentBetween);
      } else node[key] = peelParens(value, node, commentBetween);
      walk(node[key], anchor);
    }
  })(program, null);
  // esrap flushes a trailing comment inline only while it ends strictly BEFORE the
  // enclosing body's end - with no line terminator at EOF the last comment ends exactly
  // AT `Program.loc.end` and gets moved onto its own line, off the statement a
  // `core-js-disable-line` directive covers. the loc is synthetic and Program's end is
  // only ever read as that flush boundary, so widen it by one column
  if (program.loc && source.length && locate(source.length).column !== 0) {
    program.loc.end.column += 1;
  }
  // esrap 2.3.6 gap: writing a MULTI-LINE block comment ends the line itself, and a follower on
  // the closing line (`*/ foo();`) then takes the same-line pad at the head of the next line
  // (`*/\n foo();`) - a spelling the re-parse drops, so the print was not a fixed point. the print
  // copy of such a comment closes one line early: esrap takes its newline branch, which its own
  // write already satisfied, and the follower opens the line clean. the copy is esrap's alone -
  // the directive gates read the parsed comments
  function printLoc(comment) {
    const loc = { start: locate(comment.start), end: locate(comment.end) };
    if (comment.type === 'Block' && comment.value.includes('\n') && followsOnLine(source, comment.end)) loc.end.line -= 1;
    return loc;
  }
  // esrap indents every interior line of a block comment by the current indent and keeps the
  // indent the author's line carried, so a comment inside a block gained one level per pass
  // (`\t */` -> `\t\t */`). the print copy sheds up to that line's own indent from each interior
  // line and the print's indent stands alone. the LINE's indent, not the comment's column: a
  // comment deeper in its line (`const x = /**\n * @type {T}\n */ (v)`) keeps the alignment past it
  function printValue(comment) {
    if (comment.type !== 'Block' || !comment.value.includes('\n')) return comment.value;
    const lineStart = source.lastIndexOf('\n', comment.start - 1) + 1;
    let indent = 0;
    while (lineStart + indent < comment.start && isIndentChar(source.charCodeAt(lineStart + indent))) indent++;
    return indent ? comment.value.replace(new RegExp(`\\n[ \\t]{1,${ indent }}`, 'g'), '\n') : comment.value;
  }
  return {
    comments: comments.map(comment => ({ ...comment, loc: printLoc(comment), value: printValue(comment) })),
    hasChainExpression,
  };
}

// horizontal whitespace - what an indent is made of and what a same-line scan steps over
function isIndentChar(code) {
  return code === 0x20 || code === 0x09;
}

// does a token follow `offset` on the same line? horizontal whitespace is skipped; a line
// terminator or the end of the source says no
function followsOnLine(source, offset) {
  for (let i = offset; i < source.length; i++) {
    const code = source.charCodeAt(i);
    if (isIndentChar(code)) continue;
    return code !== 0x0A && code !== 0x0D && code !== 0x2028 && code !== 0x2029;
  }
  return false;
}

// print a parsed program back to source. `jsx` picks the tsx language - the caller owns
// the id-to-dialect decision, same as it owns it for the parse. the returned map keeps
// the plugin's map contract: `sources[0]` keeps the full id (SFC sub-block
// identity), `file` is the query-stripped basename, content rides only when requested
export function printProgram({ program, comments, source, id, jsx = false, includeContent = true, anchoredComments = null }) {
  // for a `.mjs`/`.cjs` parse oxc reports the hashbang BOTH as `program.hashbang` and as a
  // comment; printing both would double it - the re-emission below owns it
  const hashbangStart = program.hashbang?.start;
  const ownComments = hashbangStart === undefined ? comments : comments.filter(comment => comment.start !== hashbangStart);
  // a ChainExpression whose every `?.` an emission erased is a dead wrapper: esrap prints
  // it transparently, so an assignment left inside loses its required parens and the
  // output stops parsing - unwrap before printing (babel never emits the bare wrapper).
  // a wrapper owns exactly the links on its OWN spine (down through objects and callees,
  // stopping at a nested wrapper, which owns its own): asking whether any `?.` sits ANYWHERE
  // inside called a wrapper live off a chain it does not own - a store whose VALUE is a chain
  // kept the wrapper the render had emptied, and `null == (q = g?.self)` printed unparenthesized
  function chainOwnsLiveOptional(node) {
    for (let cur = node; cur && typeof cur === 'object';) {
      if (cur.optional === true) return true;
      if (cur.type === 'MemberExpression') cur = cur.object;
      else if (cur.type === 'CallExpression' || cur.type === 'NewExpression') cur = cur.callee;
      else if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(cur.type)) cur = cur.expression;
      else return false;
    }
    return false;
  }
  const { comments: printComments, hasChainExpression } = synthesizeLocs(program, ownComments, source);
  // the dead-chain unwrap pays a full-tree walk - a file with no ChainExpression at all
  // (the loc walk already looked at every node) has nothing to unwrap
  if (hasChainExpression) (function unwrapDeadChains(node) {
    if (Array.isArray(node)) {
      node.forEach(item => unwrapDeadChains(item));
      return;
    }
    if (!node || typeof node !== 'object') return;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      if (key === 'loc' || key === 'range') continue;
      const value = node[key];
      let child = value;
      while (child?.type === 'ChainExpression' && !chainOwnsLiveOptional(child.expression)) {
        child = child.expression;
      }
      if (child !== value) node[key] = child;
      unwrapDeadChains(node[key]);
    }
  })(program);

  const language = withCorpusGapOverrides((jsx ? tsx : ts)({ comments: printComments, boundaryTokens: true }));
  // explicitly ANCHORED leading comments (node -> texts): emitted verbatim ahead of the
  // node's own print, bypassing the loc heuristics entirely - the deterministic channel
  // for a directive that must reach the NEXT pass on its own line whatever a sibling's
  // reprint does to loc-attached comments. wrapped per node TYPE present in the map: esrap
  // dispatches every printed node through its type's handler, and a type without one (a
  // switch case, a template quasi) is printed inline by its parent and takes no anchor
  if (anchoredComments) {
    for (const type of new Set(anchoredComments.keys().map(node => node.type))) {
      const base = language[type];
      if (typeof base !== 'function') continue;
      language[type] = (node, context) => {
        const lead = anchoredComments.get(node);
        if (lead) {
          for (const text of lead) {
            context.write(text);
            context.newline();
          }
        }
        base(node, context);
      };
    }
  }
  const printed = print(program, language, {
    sourceMapSource: id,
    sourceMapContent: includeContent ? source : undefined,
  });
  let { code } = printed;
  const { map } = printed;
  // esrap pads a flushed comment with a trailing space meant for a following statement;
  // with no statement after it the pad lands at EOF - INSIDE a line comment's token, so
  // every reprint would grow the comment's value by one space. final-line horizontal
  // trivia is never part of any other token - trim it (a scan, not `[ \t]+$`: that spelling
  // is the classic polynomial-backtracking regexp)
  let trimmedEnd = code.length;
  while (trimmedEnd > 0 && (code[trimmedEnd - 1] === ' ' || code[trimmedEnd - 1] === '\t')) trimmedEnd--;
  if (trimmedEnd !== code.length) code = code.slice(0, trimmedEnd);
  // esrap has no Hashbang handler; re-emit it and shift the map one generated line down
  // (a leading `;` in the mappings string is exactly one empty line)
  if (program.hashbang) {
    code = `#!${ program.hashbang.value }\n${ code }`;
    map.mappings = `;${ map.mappings }`;
  }
  if (id !== undefined) map.file = stripQueryHash(id).split(/[/\\]/).pop() || id;
  return { code, map };
}
