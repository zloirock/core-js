// a destructured instance method off a cross-family union receiver dispatches through
// the generic runtime helper in pure (single import), same as the member form
declare const r: number[] | string;
const { includes } = r;
includes.call(r, 'x');
