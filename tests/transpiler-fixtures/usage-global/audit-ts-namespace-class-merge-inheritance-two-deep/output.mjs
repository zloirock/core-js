// two-hop inheritance: Sub -> Mid -> Base. namespace merged onto Base; Sub.build()
// must traverse two parent links to find the export. depth counter + visited-set
// guard against unbounded chains (MAX_DEPTH cap mirrors findClassMember)
class Base {}
namespace Base {
  export function build(): Base {
    return new Base();
  }
}
class Mid extends Base {}
class Sub extends Mid {}
Sub.build().at(0);