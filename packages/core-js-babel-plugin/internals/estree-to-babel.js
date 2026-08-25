import { HOST_SLOT } from '@core-js/polyfill-provider/render';
// the binding-side converter of the render canon: canonical ESTree nodes (the closed
// builder vocabulary of the core's emission) become babel nodes at the insertion boundary.
// TOTAL over that vocabulary and defined on nothing else - an unknown node type THROWS,
// which is the totality lock, not a fallback. canon checked before writing: the existing
// dialect seams are detection-side TYPE PREDICATES (`nodeType` literal mapping,
// `isNullLiteralNode` and kin) - they read either dialect, none builds or converts nodes;
// the external `estree-to-babel` package covers full ESTree and would trade the closed
// vocabulary for a dependency.
//
// dialect facts owned here:
// - `Literal` splits into babel's typed literals; a string's `raw` rides `extra.raw`
// - `Property` becomes `ObjectProperty`
// - the optional-chain dialect: an ESTree `ChainExpression` wrapper DISSOLVES; a link
//   becomes `Optional*Expression` from the FIRST `optional: true` link UPWARD (babel keeps
//   the links below the first `?.` plain - `f()?.b` is an OptionalMember over a plain
//   call), each converted link carrying its own `optional` flag; a nested
//   `ChainExpression` below a non-link slot starts its own segment, so a sealed chain
//   (`(a?.b).c`) converts to a plain member over an optional one
// - an `optional: true` link OUTSIDE any chain is invalid canonical ESTree and throws -
//   a misminted node fails loud at the boundary instead of printing a wrong spelling
// - `loc`/`start`/`end`/`range` are copied verbatim when present (relocation accuracy);
//   comment arrays convert `Line`/`Block` to `CommentLine`/`CommentBlock`
//
// embedded HOST subtrees ride `CoreJsHostSlot` wrappers (the render canon's `hostSlot`):
// the converter unwraps the slot and passes the babel subtree through UNCONVERTED - the
// wrapper never survives into an inserted tree.

const COMMENT_TYPES = { Line: 'CommentLine', Block: 'CommentBlock' };

// babel's generator prints a comment once per OBJECT (identity dedupe), and attach
// algorithms share one comment object between a node's trailing and the next node's
// leading arrays - so a shared comment must convert to ONE object, held across separate
// estreeToBabel calls too (an injector converts statement by statement); hence the
// module-level WeakMap, a pure identity memo
const CONVERTED_COMMENTS = new WeakMap();

// the canon reuses its nodes, so the converted tree may not alias ANY input object -
// a babel-side mutation must never reach back into the canonical tree; positions are
// cloned structurally, not shared
function cloneLoc(loc) {
  return loc ? { ...loc, start: { ...loc.start }, end: { ...loc.end } } : loc;
}

function convertComment(comment) {
  let converted = CONVERTED_COMMENTS.get(comment);
  if (!converted) {
    converted = { ...comment, type: COMMENT_TYPES[comment.type] ?? comment.type };
    if (converted.loc) converted.loc = cloneLoc(converted.loc);
    if (converted.range) converted.range = [...converted.range];
    CONVERTED_COMMENTS.set(comment, converted);
  }
  return converted;
}

function copyMeta(source, target) {
  if (source.start !== undefined) target.start = source.start;
  if (source.end !== undefined) target.end = source.end;
  if (source.loc !== undefined) target.loc = cloneLoc(source.loc);
  if (source.range !== undefined) target.range = [...source.range];
  for (const key of ['leadingComments', 'trailingComments', 'innerComments']) {
    if (source[key]) target[key] = source[key].map(comment => convertComment(comment));
  }
  return target;
}

function convertLiteral(node) {
  const { value } = node;
  if (typeof value === 'string') {
    const out = { type: 'StringLiteral', value };
    if (node.raw !== undefined) out.extra = { raw: node.raw, rawValue: value };
    return out;
  }
  // negatives and `-0` the canon's mint gate refuses (see the builders), so one here is a
  // misminted node failing loud - a NumericLiteral smuggling `-0` would even PRINT as `0`,
  // a wrong value. `NaN` / `Infinity` ARE in the mint domain; babel has no literal node for
  // them and parses both as Identifiers, so they convert to the node babel itself would parse
  if (typeof value === 'number') {
    if (value < 0 || Object.is(value, -0)) {
      throw new TypeError(`[estree-to-babel] Literal number outside the canonical vocabulary: ${ value }`);
    }
    if (Number.isNaN(value)) return { type: 'Identifier', name: 'NaN' };
    if (value === Infinity) return { type: 'Identifier', name: 'Infinity' };
    return { type: 'NumericLiteral', value };
  }
  if (typeof value === 'bigint') {
    if (value < 0n) throw new TypeError(`[estree-to-babel] Literal bigint outside the canonical vocabulary: ${ value }n`);
    return { type: 'BigIntLiteral', value: value.toString() };
  }
  if (typeof value === 'boolean') return { type: 'BooleanLiteral', value };
  if (value === null) return { type: 'NullLiteral' };
  throw new TypeError(`[estree-to-babel] Literal value outside the canonical vocabulary: ${ typeof value }`);
}

function convert(node) {
  return copyMeta(node, build(node));
}

// the member/call segment under a ChainExpression: only `.object` and `.callee` extend it -
// keys, arguments and every other slot convert fresh. babel types a link `Optional*` only
// from the first `optional: true` link upward, so the walk returns whether anything below
// carried a `?.` and retypes on the way out
function convertChainLink(node) {
  if (node?.type === 'MemberExpression') {
    const below = convertChainLink(node.object);
    const optionalHere = below.hasOptional || !!node.optional;
    const out = copyMeta(node, {
      type: optionalHere ? 'OptionalMemberExpression' : 'MemberExpression',
      object: below.node,
      property: convert(node.property),
      computed: !!node.computed,
    });
    if (optionalHere) out.optional = !!node.optional;
    return { node: out, hasOptional: optionalHere };
  }
  if (node?.type === 'CallExpression') {
    const below = convertChainLink(node.callee);
    const optionalHere = below.hasOptional || !!node.optional;
    const out = copyMeta(node, {
      type: optionalHere ? 'OptionalCallExpression' : 'CallExpression',
      callee: below.node,
      arguments: node.arguments.map(argument => convert(argument)),
    });
    if (optionalHere) out.optional = !!node.optional;
    return { node: out, hasOptional: optionalHere };
  }
  return { node: convert(node), hasOptional: false };
}

function build(node) {
  switch (node?.type) {
    // an embedded HOST subtree: already babel dialect - unwrap the slot, convert nothing
    case HOST_SLOT:
      return node.node;
    case 'Identifier':
      return { type: 'Identifier', name: node.name };
    case 'Literal':
      return convertLiteral(node);
    case 'ExpressionStatement':
      return { type: 'ExpressionStatement', expression: convert(node.expression) };
    case 'CallExpression':
      if (node.optional) throw new TypeError('[estree-to-babel] optional call outside a ChainExpression');
      return {
        type: 'CallExpression',
        callee: convert(node.callee),
        arguments: node.arguments.map(argument => convert(argument)),
      };
    case 'MemberExpression':
      if (node.optional) throw new TypeError('[estree-to-babel] optional member outside a ChainExpression');
      return {
        type: 'MemberExpression',
        object: convert(node.object),
        property: convert(node.property),
        computed: !!node.computed,
      };
    case 'ChainExpression':
      return convertChainLink(node.expression).node;
    case 'SequenceExpression':
      return { type: 'SequenceExpression', expressions: node.expressions.map(expression => convert(expression)) };
    case 'VariableDeclaration':
      return {
        type: 'VariableDeclaration',
        kind: node.kind,
        declarations: node.declarations.map(declaration => convert(declaration)),
      };
    case 'VariableDeclarator':
      return {
        type: 'VariableDeclarator',
        id: convert(node.id),
        init: node.init === null ? null : convert(node.init),
      };
    case 'BinaryExpression':
      return { type: 'BinaryExpression', operator: node.operator, left: convert(node.left), right: convert(node.right) };
    case 'LogicalExpression':
      return { type: 'LogicalExpression', operator: node.operator, left: convert(node.left), right: convert(node.right) };
    case 'ConditionalExpression':
      return {
        type: 'ConditionalExpression',
        test: convert(node.test),
        consequent: convert(node.consequent),
        alternate: convert(node.alternate),
      };
    case 'UnaryExpression':
      return { type: 'UnaryExpression', operator: node.operator, argument: convert(node.argument), prefix: true };
    case 'AssignmentExpression':
      return { type: 'AssignmentExpression', operator: node.operator, left: convert(node.left), right: convert(node.right) };
    case 'ObjectExpression':
      return { type: 'ObjectExpression', properties: node.properties.map(property => convert(property)) };
    case 'Property':
      return {
        type: 'ObjectProperty',
        key: convert(node.key),
        value: convert(node.value),
        computed: !!node.computed,
        shorthand: false,
      };
    case 'ImportDeclaration':
      return {
        type: 'ImportDeclaration',
        specifiers: node.specifiers.map(specifier => convert(specifier)),
        source: convert(node.source),
      };
    case 'ImportDefaultSpecifier':
      return { type: 'ImportDefaultSpecifier', local: convert(node.local) };
    default:
      throw new TypeError(`[estree-to-babel] node type outside the canonical vocabulary: ${ node?.type }`);
  }
}

export default function estreeToBabel(node) {
  return convert(node);
}
