// Substrate-neutral SUBSUMPTION resolver. given a claimed source region + the form of the rewrite that
// claims it, returns the set of inner nodes the natural visitor must SKIP - its rewrite would otherwise
// strand against the eliminated / relocated region (a compose crash, a dead import, or an orphaned transform).
// collapses the scattered skip-coordination (skip* helpers + per-site `skippedNodes.add`) into ONE
// form-dispatched function.
//
// walkNode(root, visit) is the emitter's full-subtree walker (estree `walkAstNodes`, babel `traverseFast`).
// forms:
//   replace      - the whole region is replaced / dropped: subsume every node EXCEPT subtrees re-emitted
//                  verbatim elsewhere (rescueRoots, e.g. harvested SE) or verbatim source spans (rescueRanges,
//                  e.g. residual destructure targets) whose own rewrites must stay queued for the re-emit
//   dropped-key  - a computed key folds to a static and is dropped: the discarded outer-sequence prefix is
//                  subsumed wholesale; on the resolved tail ONLY proxy-globals are subsumed (a static like
//                  `Symbol.iterator` survives the entry-availability bail to keep its `-> _Symbol$iterator` rewrite)
//   kept-spine   - a composite rewrite owns the `.object` member spine; everything below the first non-member
//                  (a SequenceExpression prefix re-emitted in place) survives
//   init-globals - the destructure rewrite owns proxy-global chains + bare identifiers in an init; instance
//                  methods (`arr.slice`) and literals survive (they compose correctly), descending logical /
//                  sequence / conditional branches
export function subsume(region, options) {
  const {
    form, rescueRoots, rescueRanges = null,
    walkNode, isProxyGlobal, outerPrefix, skippableTypes, tsWrappers,
  } = options;
  const skip = new Set();
  if (!region) return skip;
  const rescued = new Set();
  // an absent rescue list reads as "this emit re-emits nothing", which is what `[]` already means -
  // so absorb it here rather than making every caller spell its own `?? []`
  for (const root of rescueRoots ?? []) if (root) walkNode(root, node => rescued.add(node));

  function inRescueRange(node) {
    return rescueRanges ? rescueRanges.some(range => node.start >= range.start && node.end <= range.end) : false;
  }

  // descend an init expression, subsuming the proxy-global chains / bare identifiers the destructure
  // rewrite owns while instance methods + literals survive (they compose in place). the branch arms
  // recurse on the source's own nesting with no bound, unlike the walkers around them - measured and
  // left so: an init deep enough to reach it overflows the generic subtree walk long before, and
  // both hosts' traversal gives out just past that
  function walkInit(node) {
    let cur = node;
    while (cur) {
      switch (cur.type) {
        case 'LogicalExpression':
          walkInit(cur.left);
          cur = cur.right;
          break;
        case 'SequenceExpression':
          cur.expressions.forEach(walkInit);
          cur = null;
          break;
        case 'ConditionalExpression':
          walkInit(cur.consequent);
          cur = cur.alternate;
          break;
        case 'ParenthesizedExpression':
        case 'ChainExpression':
          cur = cur.expression;
          break;
        case 'MemberExpression':
        case 'OptionalMemberExpression':
          if (isProxyGlobal(cur)) skip.add(cur);
          cur = cur.object;
          break;
        case 'Identifier':
          skip.add(cur);
          cur = null;
          break;
        default:
          cur = tsWrappers.has(cur.type) ? cur.expression : null;
      }
    }
  }

  switch (form) {
    case 'replace':
      walkNode(region, node => {
        if (!rescued.has(node) && !inRescueRange(node)) skip.add(node);
      });
      break;
    case 'dropped-key':
      for (const prefix of outerPrefix(region)) {
        walkNode(prefix, node => {
          if (!rescued.has(node)) skip.add(node);
        });
      }
      walkNode(region, node => {
        if (rescued.has(node)) return;
        const proxy = isProxyGlobal(node);
        if (proxy) skip.add(proxy);
      });
      break;
    case 'kept-spine': {
      let cur = region;
      while (cur) {
        skip.add(cur);
        if (cur.type !== 'MemberExpression' && cur.type !== 'OptionalMemberExpression') break;
        let { object } = cur;
        while (object && skippableTypes.has(object.type)) {
          skip.add(object);
          object = object.expression;
        }
        cur = object;
      }
      break;
    }
    case 'init-globals':
      walkInit(region);
      break;
    // an unknown form used to return the empty set, which reads as "this emit consumed nothing" -
    // the exact answer that lets a stranded rewrite through and aborts the build far from here
    default:
      throw new TypeError(`subsume: unknown form ${ JSON.stringify(form) }`);
  }
  return skip;
}
