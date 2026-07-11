interface HasFirstName {
  firstName: string;
}

interface HasLastName {
  lastName: string;
}

interface Person extends HasFirstName, HasLastName {}

function foo(p: Person) {
  p.firstName.at(0);
  // distinct method: each extends-parent resolution owns its own import
  p.lastName.includes('x');
}
