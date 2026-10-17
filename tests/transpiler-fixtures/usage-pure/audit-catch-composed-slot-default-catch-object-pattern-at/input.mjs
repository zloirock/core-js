try {
  risky();
} catch ({ at: flat }) {
  use(flat);
}
