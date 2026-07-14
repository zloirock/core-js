import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the mirror of the resolving rows: every alias here reads a shadow that legitimately WINS, so the
// receiver is not the built-in and no static may fold onto it. distinct static per row - a regression
// surfaces as that row's module appearing in the usage-global import set

// the alias is declared in the SAME scope as the shadow, so the shadow is its init
const sameRoot = Array;
export function viaSameScopeShadow() {
  const sameRoot = {};
  const sameLink = sameRoot;
  const {
    of
  } = sameLink;
  return of(1);
}

// the hop resolves to a PARAM at the alias's own declaration scope - value unknown
const paramRoot = Array;
export function viaParamAtDecl(paramRoot) {
  const paramLink = paramRoot;
  const {
    from
  } = paramLink;
  return from([1]);
}

// alias declared inside the shadowing BLOCK
const blockRoot = Object;
export function viaAliasInBlockShadow() {
  {
    const blockRoot = {};
    const blockLink = blockRoot;
    const {
      groupBy
    } = blockLink;
    return groupBy([], v => v);
  }
}

// alias declared inside the shadowing CATCH scope
const catchRoot = Promise;
export function viaAliasInCatchShadow() {
  try {
    boom();
  } catch (catchRoot) {
    const catchLink = catchRoot;
    const {
      try: attempt
    } = catchLink;
    return attempt(() => 1);
  }
}

// the LAST var declarator wins at runtime and its init is shadowed
const multiRoot = Promise;
export function viaMultiDeclLastShadowed() {
  {
    var multiHeld = multiRoot;
  }
  {
    const multiRoot = {};
    var multiHeld = multiRoot;
  }
  {
    const {
      allSettled
    } = multiHeld;
    return allSettled([]);
  }
}

// a for-init `var` whose init reads a block-local shadow
const forRoot = Map;
export function viaForInitVarShadow() {
  {
    const forRoot = {};
    for (var forHeld = forRoot; false;) break;
  }
  {
    const {
      groupBy
    } = forHeld;
    return groupBy([], v => v);
  }
}

// a `var` declared in a NESTED function does not reach the outer use at all
const nestedRoot = Promise;
export function viaNestedFnVar() {
  function inner() {
    var nestedHeld = nestedRoot;
    return nestedHeld;
  }
  {
    const {
      race
    } = nestedHeld;
    return race([]);
  }
}

// a `var` reassigned inside its declaring block no longer holds the built-in
const reassignRoot = Object;
export function viaVarReassignedInBlock() {
  {
    var reassignHeld = reassignRoot;
    reassignHeld = {};
  }
  {
    const {
      fromEntries
    } = reassignHeld;
    return fromEntries([]);
  }
}