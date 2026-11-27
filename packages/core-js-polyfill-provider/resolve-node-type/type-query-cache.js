import {
  canonAnswerTable, cycleGuardCuts, cycleGuardHas, getTypeArgs, withCanonQuestion,
} from '../helpers/ast-patterns.js';
import { isTypeReferenceNode, typeRefSegments } from './ast-shapes.js';
import { MAX_DEPTH } from './base.js';

// A substituted reference has fresh nodes but the same spelling. Intern only references and
// their simple arguments; other annotations retain identity, including descriptor markers.
// These tokens live in the same read-only question as the answers that consume them.
function typeSpelling(node, depth = 0) {
  if (!node || typeof node !== 'object' || depth > MAX_DEPTH) return node;
  let parts;
  if (isTypeReferenceNode(node)) {
    const names = typeRefSegments(node);
    if (!names) return node;
    parts = [node.type, ...names, null, ...getTypeArgs(node)?.params?.map(arg => typeSpelling(arg, depth + 1)) ?? []];
  } else if (/^TS\w+Keyword$/u.test(node.type)) {
    parts = [node.type];
  } else return node;
  const tokens = canonAnswerTable(typeSpelling, parts);
  if (!tokens) return node;
  if (!tokens.has(null)) tokens.set(null, {});
  return tokens.get(null);
}

// Answers belong to one synchronous type question, never to a rewritten file. The lookup
// anchor and exact depth are inputs too: an answer at a depth cutoff cannot serve a shallower
// read. Maps are read by content, including the written arguments carried beside resolved Types.
// Most walks key their complete incoming guard. Element walks record declarations they read;
// no other result that cut a declaration cycle is retained, including a successful fallback.
export function createTypeQueryCache(currentLookupPath, spelledTypeArgsOf) {
  const guards = [];

  // A successful element answer depends only on the declarations it actually visited being
  // absent from the incoming guard. Record misses too; a newly blocked declaration invalidates it.
  function typeGuardHas(seen, declaration) {
    for (const reads of guards) reads.add(declaration);
    return cycleGuardHas(seen, declaration);
  }

  function typeAnswer(kind, node, { scope, depth, map, seen, key, modifiers, guarded, selfKeyof }, question) {
    return withCanonQuestion(() => {
      const context = [typeAnswer, currentLookupPath(), scope, depth, typeSpelling(key),
        modifiers?.optional, modifiers?.readonly, selfKeyof];
      const written = spelledTypeArgsOf(map);
      const effective = spelledTypeArgsOf(map, true);
      for (const bindings of [map, written, effective === written ? null : effective]) {
        context.push(bindings?.size ?? -1);
        if (bindings) for (const [name, value] of bindings) context.push(name, typeSpelling(value));
      }
      if (!guarded) context.push(seen?.size ?? 0, ...seen ?? []);
      const answers = canonAnswerTable(kind, context);
      const target = typeSpelling(node);
      if (answers?.has(target)) {
        const cached = answers.get(target);
        if (!guarded) return cached;
        if ([...cached.reads].every(declaration => !seen?.has(declaration))) {
          for (const declaration of cached.reads) for (const reads of guards) reads.add(declaration);
          return cached.answer;
        }
      }
      const cuts = cycleGuardCuts();
      const reads = guarded ? new Set() : null;
      if (reads) guards.push(reads);
      let answer;
      try {
        answer = question();
      } finally {
        if (reads) guards.pop();
      }
      if (cuts === cycleGuardCuts()) answers?.set(target, guarded ? { answer, reads } : answer);
      return answer;
    });
  }
  return { typeAnswer, typeGuardHas };
}
