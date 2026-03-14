interface HasFirstName {
  firstName: string;
}

interface HasLastName {
  lastName: string;
}

interface Person extends HasFirstName, HasLastName {}

function foo(p: Person) {
  p.firstName.at(0);
  p.lastName.at(0);
}
