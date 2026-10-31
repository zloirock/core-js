import { print } from 'esrap';
import ts from 'esrap/languages/ts';
import tsx from 'esrap/languages/tsx';
import { stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';
import {
  buildOffsetToLine,
  buildOffsetToLoc,
  firstSpelledOffset,
  isLineBoundDisableDirective,
  ownedLeadingComments,
} from '@core-js/polyfill-provider/helpers/source-scan';
import { stampReplacementSpan } from './emit-shared.js';
import { sortedPrefixLength, TRANSPARENT_EXPR_WRAPPER_TYPES } from '@core-js/polyfill-provider/helpers/ast-patterns';

// the esrap printer adapter: oxc-parser hands out offsets, esrap attaches comments and
// emits sourcemap segments by `loc` - this module synthesizes the locs and owns the
// esrap-facing quirks (hashbang, map field contract). the caller
// passes BOM-free source - the plugin strips the BOM before parsing, and the output stays
// BOM-free (babel alignment; `sourcesContent` alone keeps the original bytes)

// the parse keeps `preserveParens` for detection, but the PRINT normalizes parens to the
// minimal structural set, exactly like the babel leg: esrap re-derives every required paren
// from precedence. redundant source parens are formatting, not part of the emitted tree.
// the parens esrap cannot re-derive are the ones that KEEP semantics away -
// the hosts named below, a paren-wrapped string at statement position the first: it is NOT
// a directive, so one layer stays or the reprint would promote it into the directive prologue
function peelParens(child, parent, commentBetween) {
  if (!child || child.type !== 'ParenthesizedExpression') return child;
  let inner = child.expression;
  while (inner.type === 'ParenthesizedExpression') inner = inner.expression;
  // keep a string statement out of the directive prologue. a comment before a `throw` /
  // `yield` operand also needs one layer: flushing it after the keyword would introduce
  // a forbidden line terminator (esrap guards `return` itself, not these two)
  if (parent?.type === 'ExpressionStatement' && inner.type === 'Literal' && typeof inner.value === 'string') {
    child.expression = inner;
    return child;
  }
  if ((parent?.type === 'ThrowStatement' || parent?.type === 'YieldExpression') && commentBetween(child, inner)) {
    child.expression = inner;
    child.commentInside = true;
    return child;
  }
  if (typeof child.ownedCommentsAt === 'number') {
    Object.assign(inner, { ownedCommentsAt: child.ownedCommentsAt, ownedCommentsEnd: child.ownedCommentsEnd });
    stampReplacementSpan(inner, { start: child.ownedCommentsAt, end: child.ownedCommentsEnd });
  }
  return inner;
}

// the synthetic paren node the gap overrides hand to a base printer to restore grouping
function parenthesize(expression) {
  return { type: 'ParenthesizedExpression', expression, loc: expression.loc };
}

// esrap 2.4.0 gaps, measured by the roundtrip gate over the fixture corpus; every override
// carries its reproducing shape and dies as upstream catches up
function withCorpusGapOverrides(language, tails) {
  // a concise arrow body whose LEFT EDGE is an object literal needs parens: bare, that `{`
  // opens a BLOCK body. esrap handles a direct object operand, but misses nested left edges
  // such as `() => ({ a: 1 } || x || y)`
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
  // esrap handles casts and lower-precedence bases, but adjacent instantiations still
  // fuse into invalid `f<T><U>` without a boundary around the inner instantiation
  const baseInstantiation = language.TSInstantiationExpression;
  language.TSInstantiationExpression = (node, context) => {
    if (node.expression.type !== 'TSInstantiationExpression') return baseInstantiation(node, context);
    baseInstantiation({ ...node, expression: parenthesize(node.expression) }, context);
  };
  // esrap prints a destructuring pattern's annotation but never its `?` (a declare-signature
  // `([a]?: T[])` / `({ a }?: O)` param; Identifier carries its own upstream). the annotation is
  // stripped from what the base sees only so the marker can land BEFORE it, in source order -
  // and the tree stays unmutated
  for (const type of ['ArrayPattern', 'ObjectPattern']) {
    const basePattern = language[type];
    language[type] = (node, context) => {
      if (!node.optional) return basePattern(node, context);
      const { typeAnnotation, ...bare } = node;
      basePattern(bare, context);
      context.write('?');
      if (typeAnnotation) context.visit(typeAnnotation);
    };
  }
  // oxc gives the inner parameter an empty decorators array. esrap prefers that array
  // over the parameter property's own decorators and drops them; omit only the empty slot
  const baseParameterProperty = language.TSParameterProperty;
  language.TSParameterProperty = (node, context) => {
    if (!node.decorators?.length || node.parameter.decorators?.length) return baseParameterProperty(node, context);
    baseParameterProperty({ ...node, parameter: { ...node.parameter, decorators: undefined } }, context);
  };
  // a TS cast as a pattern default's target needs parens: esrap prints `{ a: o.f as any = d }`, which a
  // TS parser reads as a cast of an assignment and rejects
  const baseAssignmentPattern = language.AssignmentPattern;
  language.AssignmentPattern = (node, context) => {
    const { type } = node.left ?? {};
    if (type !== 'TSAsExpression' && type !== 'TSSatisfiesExpression' && type !== 'TSTypeAssertion') {
      return baseAssignmentPattern(node, context);
    }
    baseAssignmentPattern({ ...node, left: parenthesize(node.left) }, context);
  };
  // esrap shares the rest visitor with spread syntax and omits parameter decorators.
  const baseRest = language.RestElement;
  language.RestElement = (node, context) => {
    if (node.decorators?.length) {
      for (const decorator of node.decorators) {
        context.visit(decorator);
        context.write(' ');
      }
    }
    baseRest(node, context);
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
    return baseProperty(node, context);
  };
  // the one paren layer the peel keeps around a commented `throw` / `yield` operand opens its
  // operand on a fresh line, the way the author wrote it: esrap flushes the comment right after
  // the `(` otherwise, and a line-bound directive that leaves its own line is what the roundtrip
  // gate holds against. the kept string-statement layer has no comment inside and prints inline
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
  // a list's tail follows its last member, inside the list (`List tails` below)
  const baseVisit = language._;
  language._ = (node, context, visit) => {
    baseVisit(node, context, visit);
    const trailing = tails.byEnd.get(tails.ownerEnds.get(node));
    if (trailing && !tails.written.has(trailing)) {
      writeListTail(trailing, context, 'code');
      tails.written.add(trailing);
    }
    const tail = tails.byMember.get(node);
    if (!tail) return;
    writeListTail(tail, context, 'code');
    tails.written.add(tail);
  };
  // esrap writes a default or a namespace import's name without visiting its specifier, so a comment
  // trailing that name rides the write instead - or it would print past `from`
  const baseImport = language.ImportDeclaration;
  language.ImportDeclaration = (node, context) => {
    if (!node.specifiers?.some(specifier => tails.ownerEnds.has(specifier))) return baseImport(node, context);
    baseImport(node, new Proxy(context, {
      get(target, key) {
        if (key !== 'write') return typeof target[key] === 'function' ? target[key].bind(target) : target[key];
        return (text, at) => {
          target.write(text, at);
          const trailing = tails.byEnd.get(tails.ownerEnds.get(at));
          if (!trailing || tails.written.has(trailing)) return;
          writeListTail(trailing, target, 'code');
          tails.written.add(trailing);
        };
      },
    }));
  };
  // an empty list has no member to follow: a carrier stands in for one. an empty switch body breaks
  // its line ahead of the carrier itself, an argument list does not
  language.ListTailCarrier = (node, context) => {
    writeListTail(node.tail, context, node.lead);
    tails.written.add(node.tail);
  };
  for (const [type, key, lead] of [
    ['CallExpression', 'arguments', 'open'],
    ['NewExpression', 'arguments', 'open'],
    ['SwitchStatement', 'cases', 'break'],
  ]) {
    const base = language[type];
    language[type] = (node, context) => {
      const tail = tails.byHost.get(node);
      const gap = tails.byGap.get(node);
      if (!tail && !gap) return base(node, context);
      base({
        ...node,
        ...tail ? { [key]: [{ type: 'ListTailCarrier', tail, lead }] } : null,
        // the `?.` gap rides where the type arguments print, and there are none (`claimOptionalCallGap`)
        ...gap ? { typeArguments: { type: 'ListTailCarrier', tail: gap, lead: 'code' } } : null,
      }, context);
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
    const comment = firstCommentFrom(outer.start);
    return !!comment && comment.end <= inner.start;
  }
  // the first comment opening at or after `offset`, or null: the list is source-ordered
  function firstCommentFrom(offset) {
    return comments[sortedPrefixLength(comments, comment => comment.start < offset)] ?? null;
  }
  // ... and a binding host's VALUE that a line-bound directive opens its own line ahead of
  // (`const x =\n  // core-js-disable-next-line\n  v`): esrap flushes the comment after the `=`, which
  // moves the directive off its line - the value prints in the kept paren layer instead, the throw /
  // yield operand's rule. `slots` is the host's entry (`DIRECTIVE_VALUE_SLOTS`), asked once per node by the walk
  function directiveLedValue(node, slots) {
    const left = node[slots[0]];
    const value = node[slots[1]];
    if (typeof left?.end !== 'number' || typeof value?.start !== 'number') return false;
    const comment = firstCommentFrom(left.end);
    return !!comment && comment.end <= value.start && isLineBoundDisableDirective(comment.value)
      && opensOwnLine(source, comment.start);
  }
  const locate = buildOffsetToLoc(source);
  let hasChainExpression = false;
  // Nodes marked to keep their own leading comments after a rewrite moves them.
  const heirs = [];
  // the positioned hosts of a list tail (`collectListTails`)
  const listHosts = [];
  // where each trailing candidate's code ends, and the innermost node ending there (`collectTrailingComments`)
  const trailEnds = trailingCommentEnds(comments, source);
  const endOwners = new Map();
  const ownedEnds = new Set(trailEnds.values());
  function ownEnd(end, node) {
    const owners = endOwners.get(end);
    if (owners) owners.push(node);
    else endOwners.set(end, [node]);
  }
  // a paren layer the print sheds leaves its closing offset to what it wrapped: a comment after
  // `(a || b)` trails the operator expression, as it does in the babel leg
  function peelOwnedParens(value, parent) {
    const peeled = peelParens(value, parent, commentBetween);
    for (let layer = value; layer !== peeled && layer?.type === 'ParenthesizedExpression'; layer = layer.expression) {
      if (ownedEnds.has(layer.end)) ownEnd(layer.end, peeled);
    }
    return peeled;
  }
  const sourceStarts = program.defaultCommentSpans?.length ? [] : null;
  (function walk(node, anchor) {
    if (Array.isArray(node)) {
      for (const item of node) walk(item, anchor);
      return;
    }
    if (!node || typeof node !== 'object') return;
    // the flag feeds the dead-chain gate, and a SYNTHESIZED chain (no source positions,
    // so the loc branch below never sees it) must arm it too
    if (node.type === 'ChainExpression') hasChainExpression = true;
    if (typeof node.ownedCommentsAt === 'number') heirs.push(node);
    if (typeof node.type === 'string') {
      if (sourceStarts) {
        const sourceStart = sourceOffset(node, 'start');
        if (Number.isInteger(sourceStart)) sourceStarts.push(sourceStart);
      }
      if (typeof node.start === 'number' && typeof node.end === 'number') {
        node.loc = { start: locate(node.start), end: locate(node.end) };
        anchor = node.loc;
        if (Object.hasOwn(LIST_TAIL_HOSTS, node.type) || node.type === 'TemplateLiteral') listHosts.push(node);
        if (ownedEnds.has(node.end)) ownEnd(node.end, node);
      } else if (node.replacedSpan) {
        // a drain REPLACEMENT carries the replaced host's span in the side channel - it maps
        // (and anchors its minted innards) exactly where the host stood
        node.loc = { start: locate(node.replacedSpan.start), end: locate(node.replacedSpan.end) };
        anchor = node.loc;
        if (ownedEnds.has(node.replacedSpan.end)) ownEnd(node.replacedSpan.end, node);
      } else if (node.type === 'BlockStatement' && anchor) {
        // esrap resets its comment cursor on entering a body. A relocated loop body
        // without a location resets it to EOF and loses comments after the loop.
        node.loc = { start: anchor.start, end: anchor.end };
      } else if (/(?:Declaration|Statement)$/.test(node.type)) {
        // an INJECTED statement maps no user region of its own, and a span would drive esrap's
        // blank-line margins besides. one spelling a source node opens where that node does, as a
        // point: a comment ahead of the node flushes ahead of the statement, not inside it
        // (`const _ref = // note\nsrc.y;`)
        const spelled = firstSpelledOffset(node);
        if (spelled !== null) node.loc = { start: locate(spelled), end: locate(spelled) };
        // A returned synthetic getter still belongs to this activation. Its body needs
        // that source anchor or esrap advances its comment cursor to EOF on entry.
        if (node.type !== 'ReturnStatement') anchor = null;
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
    const directiveSlots = DIRECTIVE_VALUE_SLOTS[node.type];
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      if (key === 'loc' || key === 'replacedSpan') continue;
      const value = node[key];
      if (!value || typeof value !== 'object') continue;
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) value[i] = peelOwnedParens(value[i], node);
      } else {
        node[key] = peelOwnedParens(value, node);
        if (directiveSlots && key === directiveSlots[1] && directiveLedValue(node, directiveSlots)) {
          node[key] = { type: 'ParenthesizedExpression', expression: node[key], commentInside: true };
        }
      }
      walk(node[key], anchor);
    }
  })(program, null);
  // a multiline JSDoc cast followed on its closing line still accumulates a newline
  // inside the generated parens. ending the print-only comment loc one line earlier
  // makes the comment flush take its newline branch before opening the cast
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
    endOwners,
    heirs,
    listHosts,
    locate,
    sourceStarts: sourceStarts?.sort((a, b) => a - b),
    trailEnds,
  };
}

// Comments each heir owns, by index: a statement's annotation (`ownedLeadingComments`),
// or a moved default's leading run (across opening parentheses) and comments inside its source span.
function ownedCommentIndexes({ heirs, comments, source }) {
  const owned = new Map();
  if (!heirs.length || !comments.length) return owned;
  const lineOf = buildOffsetToLine(source);
  const spans = [];
  for (const heir of heirs) {
    const expression = !/(?:Declaration|Statement)$/.test(heir.type);
    let end = heir.ownedCommentsAt;
    const closed = sortedPrefixLength(comments, comment => comment.end <= end);
    let first = closed;
    while (first > 0) {
      const gap = source.slice(comments[first - 1].end, end);
      if ((expression ? gap.replaceAll('(', '') : gap).trim()) break;
      end = comments[--first].start;
    }
    let code = end - 1;
    while (code >= 0 && !source[code].trim()) code--;
    const run = ownedLeadingComments({
      comments: comments.slice(first, closed),
      statementLine: lineOf(heir.ownedCommentsAt),
      codeLine: !expression && code >= 0 ? lineOf(code) : 0,
      offsetToLine: lineOf,
    });
    if (run.length) owned.set(heir, run.map(comment => comments.indexOf(comment, first)));
    if (typeof heir.ownedCommentsEnd === 'number') {
      spans.push({ heir, start: heir.ownedCommentsAt, end: heir.ownedCommentsEnd });
    }
  }
  // Source default spans nest or stand apart. Sweep them once so deeply nested defaults
  // do not repeatedly collect every descendant comment; the innermost frame owns each one.
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const owners = new Map();
  const active = [];
  let next = 0;
  for (let index = 0; index < comments.length; index++) {
    const comment = comments[index];
    while (next < spans.length && spans[next].start <= comment.start) {
      const span = spans[next++];
      while (active.length && active.at(-1).end <= span.start) active.pop();
      active.push(span);
    }
    while (active.length && active.at(-1).end < comment.end) active.pop();
    if (active.length) owners.set(index, active.at(-1).heir);
  }
  // Explicit leading ownership, including a statement inside a default, is more specific.
  for (const [heir, indexes] of owned) for (const index of indexes) owners.set(index, heir);
  owned.clear();
  for (let index = 0; index < comments.length; index++) {
    const heir = owners.get(index);
    if (!heir) continue;
    if (!owned.has(heir)) owned.set(heir, []);
    owned.get(heir).push(index);
  }
  return owned;
}

// a comment laid out like esrap's own: a block one source line per printed line
function writeComment(comment, context) {
  if (typeof comment === 'string') context.write(comment);
  else if (comment.type === 'Line') context.write(`//${ comment.value }`);
  else {
    const lines = comment.value.split('\n');
    for (let index = 0; index < lines.length; index++) {
      if (index > 0) context.newline();
      context.write(`${ index === 0 ? '/*' : '' }${ lines[index] }${ index === lines.length - 1 ? '*/' : '' }`);
    }
  }
}

// a comment the anchored channel leads a node with, each on its own line ahead of the node
function writeAnchoredComment(comment, context) {
  writeComment(comment, context);
  context.newline();
}

// --- List tails ---

// esrap closes these lists without flushing the comments ahead of the closing token, and its
// cursor flushes a comment only ahead of the next positioned node: a comment after the last member,
// or inside an empty list, printed after the statement or ahead of the one below it - a commented-out
// last argument left its call, and a `core-js-disable-next-line` closing an argument list came to
// cover the next statement. each list's tail is printed inside it instead, in source order and on
// the lines it opened on: [members, closing token, opening token of an empty list]. an arrow's
// parameters need no entry: a comment between their `)` and the `=>` prints ahead of the `)`, the
// same place to the roundtrip gate - inside the arrow, after its last parameter
const LIST_TAIL_HOSTS = {
  CallExpression: node => [node.arguments, ')', '('],
  NewExpression: node => [node.arguments, ')', '('],
  ImportExpression: node => [[node.source, ...node.arguments ?? [], node.options].filter(Boolean), ')', '('],
  SwitchStatement: node => [node.cases, '}', '{'],
  TSTypeParameterInstantiation: node => [node.params, '>', '<'],
};

// a node's `start` or `end` offset in the source: its own, or that of the span a rebuilt node stands in for
function sourceOffset(node, edge) {
  return Number.isInteger(node?.[edge]) ? node[edge] : node?.replacedSpan?.[edge];
}

// the tails of the positioned hosts the print walk met, keyed by the member they follow - or by the
// host, for an empty list. a comment another channel owns (`taken`) stays there, and a comment two
// hosts would claim (a copied span) goes to the first
function collectListTails({ hosts, comments, taken, source, locate }) {
  const tails = {
    byMember: new Map(),
    byHost: new Map(),
    byGap: new Map(),
    byEnd: new Map(),
    ownerEnds: new Map(),
    indexes: new Set(),
    written: new Set(),
  };
  if (!hosts.length || !comments.length) return tails;
  // the comment covering `offset`, if any: the list is source-ordered and its members do not overlap
  function commentAt(offset) {
    const comment = comments[sortedPrefixLength(comments, ({ start }) => start <= offset) - 1];
    return comment?.end > offset ? comment : null;
  }
  // the nearest code character on either side of `offset`, past whitespace and comments
  function codeOffset(offset, step) {
    for (let i = offset; i >= 0 && i < source.length; i += step) {
      const comment = commentAt(i);
      if (comment) i = step > 0 ? comment.end - 1 : comment.start;
      else if (source[i].trim()) return i;
    }
    return -1;
  }
  // the gap between an optional call's `?.` and its `(` prints after the `?.` as its type arguments
  // would (`f?. /* c */(x)`): with none to print, the cursor flushed it into the argument list
  function claimOptionalCallGap(host) {
    const [first] = host.arguments;
    const open = codeOffset((first ? sourceOffset(first, 'start') : host.end - 1) - 1, -1);
    if (source[open] !== '(') return;
    const dot = codeOffset(open - 1, -1);
    if (source[dot] !== '.' || source[dot - 1] !== '?') return;
    const run = claimRun(dot + 1, open);
    if (run.length) tails.byGap.set(host, tail(run, dot + 1, open));
  }
  function claimRun(from, to) {
    const run = [];
    for (let index = sortedPrefixLength(comments, ({ start }) => start < from); index < comments.length; index++) {
      if (comments[index].end > to) break;
      if (!taken.has(index) && !tails.indexes.has(index)) run.push(index);
    }
    for (const index of run) tails.indexes.add(index);
    return run;
  }
  function tail(run, from, to) {
    return { comments: run.map(index => comments[index]), indexes: run, fromLine: locate(from).line, toLine: locate(to).line };
  }
  function claim({ host, member, from, to }) {
    const run = claimRun(from, to);
    if (!run.length) return;
    if (member) tails.byMember.set(member, tail(run, from, to));
    else tails.byHost.set(host, tail(run, from, to));
  }
  for (const host of hosts) {
    if (host.type === 'CallExpression' && host.optional && !host.typeArguments) claimOptionalCallGap(host);
    if (host.type === 'TemplateLiteral') {
      // each substitution is a list of one, closed by its own `}`
      for (const member of host.expressions) {
        const from = sourceOffset(member, 'end');
        const to = Number.isInteger(from) ? codeOffset(from, 1) : -1;
        if (source[to] === '}') claim({ host, member, from, to });
      }
      continue;
    }
    const [members, close, open] = LIST_TAIL_HOSTS[host.type](host);
    const to = host.end - 1;
    if (source[to] !== close) continue;
    const member = members.at(-1) ?? null;
    const from = member ? sourceOffset(member, 'end') : codeOffset(to - 1, -1) + 1;
    if (!Number.isInteger(from) || (!member && source[from - 1] !== open)) continue;
    claim({ host, member, from, to });
  }
  return tails;
}

// a list's tail where it closes: a comment opening on a later line than the code before it keeps
// its own line, a line comment ends one, and so does a block whose list closes on a later line.
// `lead` is what the tail follows - a member (`code`), the opening token (`open`), or a line break
// the host already wrote (`break`)
function writeListTail({ comments, fromLine, toLine }, context, lead) {
  let line = fromLine;
  let fresh = lead === 'break';
  let separated = lead !== 'code';
  for (const comment of comments) {
    if (comment.loc.start.line > line) {
      if (!fresh) context.newline();
    } else if (!fresh && !separated) context.write(' ');
    writeComment(comment, context);
    fresh = comment.type === 'Line' || comment.loc.end.line < toLine;
    if (fresh) context.newline();
    separated = false;
    line = comment.loc.end.line;
  }
}

// a comment that opens on the line a node closes on, with nothing but blanks and other such comments
// between them, trails that node: esrap flushes a comment only ahead of the next positioned node, so
// every token in between used to print first (`f /* c */ (x)` as `f(/* c */ x)`, `x /* c */ = 1` as
// `x = /* c */ 1`, a comment ahead of `?.` past the type arguments an instantiation fold moved behind
// it). the offset the code before each such comment ends at, by comment index
function trailingCommentEnds(comments, source) {
  const ends = new Map();
  for (let index = 0; index < comments.length; index++) {
    let at = comments[index].start - 1;
    for (let previous = index - 1; ; previous--) {
      while (at >= 0 && isIndentChar(source.charCodeAt(at))) at--;
      const earlier = comments[previous];
      if (earlier?.end !== at + 1) break;
      // a block spanning lines puts the code before it on another line
      if (/[\n\r\u2028\u2029]/.test(earlier.value)) at = -1;
      else at = earlier.start - 1;
    }
    if (at >= 0 && !isLineTerminator(source.charCodeAt(at))) ends.set(index, at + 1);
  }
  return ends;
}

// the trailing comments by the offset their code ends at, behind the list tails. every node closing
// there owns them, and the first whose visit completes - the innermost the printer spells as a node -
// writes them
function collectTrailingComments({ tails, trailEnds, endOwners, comments, taken, locate }) {
  for (const [index, end] of trailEnds) {
    const owners = endOwners.get(end);
    if (!owners || taken.has(index) || tails.indexes.has(index)) continue;
    tails.indexes.add(index);
    const comment = comments[index];
    const tail = tails.byEnd.get(end);
    if (tail) {
      tail.comments.push(comment);
      tail.indexes.push(index);
      tail.toLine = Math.max(tail.toLine, comment.loc.end.line);
      continue;
    }
    tails.byEnd.set(end, { comments: [comment], indexes: [index], fromLine: locate(end).line, toLine: comment.loc.end.line });
    for (const owner of owners) tails.ownerEnds.set(owner, end);
  }
}

// the tails no visit wrote go back to the cursor; true when there were any
function dropUnwrittenTails(tails) {
  let dropped = false;
  for (const map of [tails.byMember, tails.byHost, tails.byGap, tails.byEnd]) {
    for (const [key, tail] of map) {
      if (tails.written.has(tail)) continue;
      map.delete(key);
      for (const index of tail.indexes) tails.indexes.delete(index);
      dropped = true;
    }
  }
  tails.written.clear();
  return dropped;
}

function isLineTerminator(code) {
  return code === 0x0A || code === 0x0D || code === 0x2028 || code === 0x2029;
}

// horizontal whitespace - what an indent is made of and what a same-line scan steps over
function isIndentChar(code) {
  return code === 0x20 || code === 0x09;
}

// the binding hosts whose value slot a directive may lead: [the slot ahead of the `=`, the value slot]
const DIRECTIVE_VALUE_SLOTS = {
  VariableDeclarator: ['id', 'init'],
  AssignmentPattern: ['left', 'right'],
  AssignmentExpression: ['left', 'right'],
};

// does nothing but horizontal whitespace precede `offset` on its line?
function opensOwnLine(source, offset) {
  for (let i = offset - 1; i >= 0; i--) {
    const code = source.charCodeAt(i);
    if (isIndentChar(code)) continue;
    return code === 0x0A || code === 0x0D || code === 0x2028 || code === 0x2029;
  }
  return true;
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
  const {
    comments: locatedComments, endOwners, hasChainExpression, heirs, listHosts, locate, sourceStarts, trailEnds,
  } = synthesizeLocs(program, ownComments, source);
  // A surviving source node keeps its default's comments, including a rewritten default's span.
  // No source node in the span means the default was removed: do not annotate a lifted effect.
  for (const [start, end] of program.defaultCommentSpans ?? []) {
    const next = sortedPrefixLength(sourceStarts, offset => offset < start);
    if (next === sourceStarts.length || sourceStarts[next] >= end) {
      heirs.push({ ownedCommentsAt: start, ownedCommentsEnd: end, discardedComments: true });
    }
  }
  // Owned comments leave the offset flush: moved defaults keep theirs, removed defaults drop theirs.
  const heirComments = ownedCommentIndexes({ heirs, comments: ownComments, source });
  const taken = new Set(heirComments.values().toArray().flat());
  // a list's tail prints where the list closes, and a comment trailing a node on its line right after
  // that node - both off the cursor like an owned run
  const tails = collectListTails({ hosts: listHosts, comments: locatedComments, taken, source, locate });
  collectTrailingComments({ tails, trailEnds, endOwners, comments: locatedComments, taken, locate });
  const anchors = new Map(anchoredComments);
  const localized = new Map();
  for (const [heir, indexes] of heirComments) {
    if (heir.discardedComments) continue;
    const owned = indexes.map(index => locatedComments[index]);
    if (typeof heir.ownedCommentsEnd === 'number') localized.set(heir, owned);
    else anchors.set(heir, [...owned, ...anchors.get(heir) ?? []]);
  }
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

  // the print proper, over whatever the tails left on the cursor
  function render() {
    const printComments = taken.size || tails.indexes.size
      ? locatedComments.filter((comment, index) => !taken.has(index) && !tails.indexes.has(index)) : locatedComments;
    // Every moved default has its own comment cursor. Its receiver's later source offsets must
    // not flush comments out of the default, including annotations inside call arguments.
    function createLanguage(dialectComments) {
      const dialect = withCorpusGapOverrides((jsx ? tsx : ts)({ comments: dialectComments }), tails);
      for (const type of new Set(anchors.keys().map(node => node.type))) {
        const base = dialect[type];
        if (typeof base !== 'function') continue;
        dialect[type] = (node, context) => {
          for (const comment of anchors.get(node) ?? []) writeAnchoredComment(comment, context);
          base(node, context);
        };
      }
      return dialect;
    }
    const language = createLanguage(printComments);
    function visitLocalized(node, context, visit, base) {
      const frameComments = localized.get(node);
      if (!frameComments?.length) return base(node, context, visit);
      const previous = { ...language };
      const local = createLanguage(frameComments);
      Object.assign(language, local, { _: (child, ctx, next) => visitLocalized(child, ctx, next, local._) });
      try {
        local._(node, context, child => local[child.type](child, context));
        // Empty argument lists have no child to flush their interior comments. End the local
        // cursor here, as the next source token would, before restoring the enclosing frame.
        if (node.loc) local._(
          { type: 'EmptyStatement', loc: { start: node.loc.end, end: node.loc.end } }, context,
          () => { /* Flush comments without a source token. */ },
        );
      } finally {
        Object.assign(language, previous);
      }
    }
    if (localized.size) {
      const base = language._;
      language._ = (node, context, visit) => visitLocalized(node, context, visit, base);
    }
    return print(program, language, {
      sourceMapSource: id,
      sourceMapContent: includeContent ? source : undefined,
    });
  }
  let printed = render();
  // a tail rides its node's visit, and a node the printer spells without visiting it would take the
  // tail down with it: such a tail goes back to the cursor, and the file prints again
  if (dropUnwrittenTails(tails)) printed = render();
  let { code } = printed;
  const { map } = printed;
  // esrap has no Hashbang handler; re-emit it and shift the map one generated line down
  // (a leading `;` in the mappings string is exactly one empty line)
  if (program.hashbang) {
    code = `#!${ program.hashbang.value }\n${ code }`;
    map.mappings = `;${ map.mappings }`;
  }
  if (id !== undefined) map.file = stripQueryHash(id).split(/[/\\]/).pop() || id;
  return { code, map };
}
