// `switch ((side(), typeof x))` - SequenceExpression around discriminant evaluates to
// the tail (typeof x). previously only paren / TS were peeled; extended to also strip
// SE-tail so the case-narrow surfaces same as bare `switch (typeof x)`
declare const x: string | string[];
declare function ping(): void;
switch ((ping(), typeof x)) {
  case 'string':
    x.at(0);
    break;
}
