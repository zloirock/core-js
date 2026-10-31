// super-call SE rewrite at method-body start: no predecessor token to fuse with, so the
// ASI guard must NOT inject a spurious `;` even though the replacement leads with `(`.
// statement-leading position AND a fusable predecessor token are both required for the
// guard - either missing means the wrap shape stays bare-leading.
class C extends Array {
  static run() {
    super[(console.log('SE'), 'from')]([1, 2]);
  }
}
export { C };
