// the structural identity the AST engine is held to, shared by the no-op roundtrip gate
// and the babel-baseline comparator. ignored as FORMATTING: positions, the literal `raw`
// spelling (a divergence THERE is a printed-byte defect no tree compare can own - the node
// builders keep `raw` trustworthy instead, and only where it is needed), paren nodes (value
// AND type level - the printer normalizes to the minimal structural set), statement-list
// `EmptyStatement`s (semantics-free in a LIST; a loop's empty BODY is a node field and
// survives), the `shorthand` flag, nested-sequence grouping
// (`(a, (b, c))` == `(a, b, c)` - babel's generator flattens it on reprint), and a sealed
// chain under an OPTIONAL continuation (`(a?.b)?.()` == `a?.b?.()` - runtime-equal for
// every nullish split, and babel prints the unsealed spelling; a seal under a NON-optional
// continuation stays load-bearing and IS compared). `directive` stays - a re-quoted
// prologue with escapes would change which directives the block carries
// Statement lists split comma declarations and expression statements without moving
// effects across a statement or scope boundary. Generated var lists without initializers
// have no evaluation order; their declarations sort before names are canonicalized.
// the MINTED names (`_ref3`, `_unused5`) number by emission order, which the two legs reach
// differently once any earlier statement differs - the number is formatting, the binding is what
// is compared. One map spans the program, so statement splits cannot erase reference identity.
// Only declared bindings and their references rename; property names and free names stay exact.
import { traverse } from 'estree-toolkit';

const MINTED_NAME = /^_(?:ref|unused)\d*$/;
let mintedNames = null;
let mintedBindings = null;

// Comments are a separate parser channel. Block indentation can reflow; text, kind,
// multiplicity and order still participate in fixture comparison.
export function commentSignature(comments) {
  return comments.map(comment => [comment.type,
    comment.type === 'Block' ? comment.value.replaceAll(/\n[\t ]*/g, '\n') : comment.value]);
}
function canonicalMinted(node) {
  const binding = mintedBindings?.get(node);
  if (!binding) return node.name;
  if (!mintedNames.has(binding)) mintedNames.set(binding, `${ node.name.replace(/\d+$/, '') }#${ mintedNames.size }`);
  return mintedNames.get(binding);
}

export function strip(node) {
  if (node?.type !== 'Program') return stripNode(node);
  mintedNames = new Map();
  const bindings = new WeakMap();
  try {
    try {
      traverse(node, {
        $: { scope: true },
        Identifier(path) {
          if (!MINTED_NAME.test(path.node.name)) return;
          const binding = path.scope.getBinding(path.node.name);
          if (!binding || bindings.has(binding.identifierPath.node)) return;
          for (const site of [binding.identifierPath, ...binding.references, ...binding.constantViolations]) {
            bindings.set(site.node, binding);
          }
        },
      });
      mintedBindings = bindings;
    } catch {
      // Scope crawling does not support every TS signature. Keep all names exact on failure.
    }
    return stripNode(node);
  } finally {
    mintedNames = null;
    mintedBindings = null;
  }
}

function sequenceItems(expressions) {
  return expressions.flatMap(item => {
    const expression = peelSpelling(item);
    return expression?.type === 'SequenceExpression' ? sequenceItems(expression.expressions) : [item];
  });
}

// Only statement lists may split. A for head, unbraced body and a callee keep their shape.
function statementList(nodes) {
  return nodes.filter(item => item?.type !== 'EmptyStatement').flatMap(node => {
    if (node.type === 'VariableDeclaration') {
      if (node.kind === 'var' && node.declarations.every(item => !item.init && item.id.type === 'Identifier' && MINTED_NAME.test(item.id.name))) {
        return [{ ...node, declarations: node.declarations.toSorted((a, b) => a.id.name.localeCompare(b.id.name, 'en')) }];
      }
      return node.declarations.map(declaration => ({ ...node, declarations: [declaration] }));
    }
    const expression = node.type === 'ExpressionStatement' && !node.directive && peelSpelling(node.expression);
    return expression?.type === 'SequenceExpression'
      ? sequenceItems(expression.expressions).map(item => ({ ...node, expression: item }))
      : [node];
  });
}

function stripNode(node) {
  while (node?.type === 'ParenthesizedExpression') node = node.expression;
  while (node?.type === 'TSParenthesizedType') node = node.typeAnnotation;
  if (Array.isArray(node)) return node.filter(item => item?.type !== 'EmptyStatement').map(item => strip(item));
  if (node && typeof node === 'object') {
    if (node.type === 'SequenceExpression') {
      return { expressions: sequenceItems(node.expressions).map(item => strip(item)), type: 'SequenceExpression' };
    }
    // spelling-normalization loop, to a fixed point (a lift can expose the other):
    // `new ((f || g)<string>)()` == `new ((f || g))<string>()` - the instantiation is
    // type-level spelling, babel hoists its arguments onto the call/new host; and a sealed
    // chain under an OPTIONAL continuation unseals (see the header)
    for (let normalized = true; normalized;) {
      normalized = false;
      if ((node.type === 'CallExpression' || node.type === 'NewExpression' || node.type === 'TaggedTemplateExpression') && !node.typeArguments) {
        const key = node.type === 'TaggedTemplateExpression' ? 'tag' : 'callee';
        let target = node[key];
        while (target?.type === 'ParenthesizedExpression') target = target.expression;
        if (target?.type === 'TSInstantiationExpression') {
          node = { ...node, [key]: target.expression, typeArguments: target.typeArguments ?? target.typeParameters };
          normalized = true;
          continue;
        }
      }
      if ((node.type === 'CallExpression' || node.type === 'MemberExpression') && node.optional) {
        const key = node.type === 'CallExpression' ? 'callee' : 'object';
        let target = node[key];
        while (target?.type === 'ParenthesizedExpression') target = target.expression;
        if (target?.type === 'ChainExpression') {
          node = { ...node, [key]: target.expression };
          normalized = true;
        }
      }
    }
    const out = {};
    for (const key of Object.keys(node).sort()) {
      if (key === 'start' || key === 'end' || key === 'loc' || key === 'range' || key === 'raw' || key === 'shorthand') continue;
      const value = Array.isArray(node[key]) && (key === 'body' || node.type === 'SwitchCase' && key === 'consequent')
        ? statementList(node[key]) : node[key];
      out[key] = key === 'name' && node.type === 'Identifier' ? canonicalMinted(node) : strip(value);
    }
    return out;
  }
  if (typeof node === 'bigint') return `${ node }n`;
  return node;
}

// where each comment sits: the path of child slots from the program to the innermost node holding
// it, and how many of that node's children close ahead of it - the comment-channel half of the
// identity above, which the signature alone cannot see: a print that flushes a comment out of a call's
// argument list keeps its text, kind and order and moves it onto the next statement, a line-bound
// directive included. the skips are the structural ones: a paren node is spelling, so a node is
// entered by the span of what it wraps, and a list's `EmptyStatement` takes no index. a comment
// closing a statement ahead of its `;` sits after the statement - the terminator is the only token
// between them, and a print may spell it ahead of the comment
export function commentPlacements(program, source, comments) {
  return comments.map(comment => commentPlacement(program, source, comment.start));
}

const PLACEMENT_SKIPPED_KEYS = new Set(['start', 'end', 'loc', 'range', 'raw', 'type']);

function peelSpelling(node) {
  while (node?.type === 'ParenthesizedExpression' || node?.type === 'TSParenthesizedType') {
    node = node.type === 'ParenthesizedExpression' ? node.expression : node.typeAnnotation;
  }
  return node;
}

function placementChildren(node) {
  const children = [];
  for (const [key, value] of Object.entries(node)) {
    if (PLACEMENT_SKIPPED_KEYS.has(key)) continue;
    if (Array.isArray(value)) {
      let index = 0;
      for (const item of value) {
        if (typeof item?.type === 'string' && item.type !== 'EmptyStatement') children.push([`${ key }.${ index++ }`, peelSpelling(item)]);
      }
    } else if (typeof value?.type === 'string') children.push([key, peelSpelling(value)]);
  }
  return children;
}

function commentPlacement(program, source, offset) {
  const frames = [];
  let node = program;
  let children = placementChildren(node);
  for (let inner = children.find(([, child]) => child.start <= offset && offset < child.end); inner;
    inner = children.find(([, child]) => child.start <= offset && offset < child.end)) {
    const [slot, child] = inner;
    frames.push({ slot, node: child, siblings: children });
    node = child;
    children = placementChildren(node);
  }
  let before = children.filter(([, child]) => child.end <= offset).length;
  while (frames.length && before === children.length && source[node.end - 1] === ';') {
    const { node: closed, siblings } = frames.pop();
    before = siblings.findIndex(([, child]) => child === closed) + 1;
    children = siblings;
    node = frames.at(-1)?.node ?? program;
  }
  return `${ frames.map(({ slot, node: { type } }) => `${ slot }:${ type }`).join('/') }#${ before }`;
}
