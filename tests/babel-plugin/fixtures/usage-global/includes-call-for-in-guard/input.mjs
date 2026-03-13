function foo(obj) {
  for (const key in obj) {
    key.includes('prefix');
  }
}
