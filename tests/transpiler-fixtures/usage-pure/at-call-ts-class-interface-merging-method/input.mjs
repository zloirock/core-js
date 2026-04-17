interface Svc {
  fetch(): number[];
}
class Svc {}
const s = new Svc();
s.fetch().at(0);
