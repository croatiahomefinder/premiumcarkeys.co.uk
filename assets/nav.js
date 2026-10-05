(function () {
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  var subBtn = document.querySelector(".sub-btn");
  var sub = document.getElementById("makes-menu");

  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("open", open);
  }
  function setSub(open) {
    subBtn.setAttribute("aria-expanded", open ? "true" : "false");
    sub.classList.toggle("open", open);
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
  }
  if (subBtn && sub) {
    subBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setSub(subBtn.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("click", function (e) {
      if (!sub.contains(e.target)) setSub(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (sub && sub.classList.contains("open")) { setSub(false); subBtn.focus(); }
    else if (nav && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
  });
})();
