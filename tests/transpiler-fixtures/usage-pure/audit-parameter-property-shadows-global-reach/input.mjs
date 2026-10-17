class Outside {
  constructor(private Set: any) {}
  reach() {
    return new Set([1]);
  }
}
new Outside(function () {}).reach();
