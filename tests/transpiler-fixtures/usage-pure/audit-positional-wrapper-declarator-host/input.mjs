// the wrapper pairing answers for any DECLARATOR the pattern reaches: a wrapper standing under a
// KEY is one descent step further into the init literal, and the claim resolves through it exactly
// as under a bare wrapper. an assignment host binds no name for a memo, but its claim is not lost
// either - the post-statement overwrite picks it up, which is what the rows show
const nb = { y: [1, [2]] };
const assignHost = (function () {
  let m;
  ([{ y: { flat: m } }] = [nb]);
  return m;
})();
const nestedWrapper = (function () {
  const { pair: [{ y: { flat } }] } = { pair: [nb] };
  return flat;
})();
export { assignHost, nestedWrapper };
