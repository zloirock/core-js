import '../scss/app.scss';

document.addEventListener('DOMContentLoaded', function(_event) {
  const menuSwitcher = document.getElementById('menu-switcher');
  const menuBackdrop = document.querySelectorAll(".menu .backdrop")[0];
  const menu = document.getElementsByClassName('menu')[0];

  function toggleMenu() {
    if (menu.classList.contains('active')) {
      menu.classList.remove('active');
    } else {
      menu.classList.add('active');
    }
  }

  menuBackdrop.addEventListener('click',function(_e) {
    toggleMenu();
  }, false);

  menuSwitcher.addEventListener('click',function(e){
    e.preventDefault();
    toggleMenu();
  },false);
});
