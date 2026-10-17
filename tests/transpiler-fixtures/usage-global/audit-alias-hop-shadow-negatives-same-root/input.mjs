// the mirror of the resolving rows: every alias here reads a shadow that legitimately WINS, so the
// receiver is not the built-in and no static may fold onto it. distinct static per row - a regression
// surfaces as that row's module appearing in the usage-global import set

// the alias is declared in the SAME scope as the shadow, so the shadow is its init
const sameRoot = Array;
