class C {
  m() { try {} catch ({ at }) { return at(0); } }
  static s() { try {} catch ({ flat }) { return flat(1); } }
}
