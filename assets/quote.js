(function () {
  var WA = "447833823384";
  var EMAIL = "info@kslimited.co.uk";

  function buildMessage(form) {
    var get = function (name) {
      var el = form.elements[name];
      return el && el.value ? el.value.trim() : "";
    };
    var lines = [
      "Quote request from premiumcarkeys.co.uk",
      "Name: " + get("name"),
      "Phone: " + get("phone"),
      "Postcode: " + get("postcode"),
      "Vehicle: " + get("make") + (get("model") ? " " + get("model") : ""),
      "Registration: " + get("reg"),
      "Service: " + get("service"),
      "Visit: " + get("visit")
    ];
    if (get("email")) lines.push("Email: " + get("email"));
    if (get("message")) lines.push("Notes: " + get("message"));
    lines.push("I will send a photo of my key next.");
    return lines.join("\n");
  }

  document.querySelectorAll("form[data-quote]").forEach(function (form) {
    var status = form.querySelector("[data-status]");
    var emailBtn = form.querySelector("[data-email]");

    function ready() {
      if (!form.checkValidity()) {
        form.reportValidity();
        return false;
      }
      return true;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!ready()) return;
      var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(buildMessage(form));
      window.open(url, "_blank", "noopener");
      if (status) status.textContent = "WhatsApp opened with your details filled in. Press send there, then attach a photo of your key.";
    });

    if (emailBtn) {
      emailBtn.addEventListener("click", function () {
        if (!ready()) return;
        var body = buildMessage(form).replace("I will send a photo of my key next.", "I will reply with a photo of my key.");
        window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Car key quote request") + "&body=" + encodeURIComponent(body);
        if (status) status.textContent = "Your email app opened with your details filled in. Press send there.";
      });
    }
  });
})();
