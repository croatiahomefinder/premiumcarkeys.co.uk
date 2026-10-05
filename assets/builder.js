(function () {
  var C = window.PCK;
  if (!C) return;
  var WA = "447833823384";
  var EMAIL = "info@kslimited.co.uk";
  var OTHER = "__other";

  var SERVICE_NAMES = { spare: "Spare key", akl: "All keys lost", canphantom: "CAN Phantom immobiliser" };

  function gbp(n) { return "£" + n.toLocaleString("en-GB"); }

  function servicesOf(make, model) {
    return (model && model.services) || make.services || ["spare", "akl"];
  }

  function makeOffers(make, service) {
    if (service === "canphantom") return true;
    return make.models.some(function (m) { return servicesOf(make, m).indexOf(service) > -1; });
  }

  function option(value, text, selected) {
    var o = document.createElement("option");
    o.value = value; o.textContent = text;
    if (selected) o.selected = true;
    return o;
  }

  document.querySelectorAll("form[data-builder]").forEach(function (form) {
    var el = function (n) { return form.elements[n]; };
    var priceBox = form.querySelector("[data-price]");
    var status = form.querySelector("[data-status]");
    var presetMake = form.getAttribute("data-make") || "";
    var presetService = form.getAttribute("data-service") || "";
    if (presetService) el("service").value = presetService;

    function currentMake() {
      var id = el("make").value;
      for (var i = 0; i < C.makes.length; i++) if (C.makes[i].id === id) return C.makes[i];
      return null;
    }
    function currentModel(make) {
      if (!make || !el("model").value || el("model").value === OTHER) return null;
      return make.models[Number(el("model").value)] || null;
    }

    function fillMakes() {
      var service = el("service").value;
      var keep = el("make").value || presetMake;
      var sel = el("make");
      sel.innerHTML = "";
      sel.appendChild(option("", "Choose a make"));
      C.makes.forEach(function (m) {
        if (makeOffers(m, service)) sel.appendChild(option(m.id, m.name, m.id === keep));
      });
      fillModels();
    }

    function fillModels() {
      var make = currentMake();
      var service = el("service").value;
      var sel = el("model");
      var keep = sel.value;
      sel.innerHTML = "";
      if (!make) {
        sel.appendChild(option("", "Choose a make first"));
        sel.disabled = true;
        update();
        return;
      }
      sel.disabled = false;
      sel.appendChild(option("", "Choose a model"));
      make.models.forEach(function (m, i) {
        if (service === "canphantom" || servicesOf(make, m).indexOf(service) > -1) {
          var label = m.name + (m.years ? " (" + m.years + ")" : "");
          sel.appendChild(option(String(i), label, String(i) === keep));
        }
      });
      sel.appendChild(option(OTHER, "My model is not listed", keep === OTHER));
      update();
    }

    function toggle() {
      var service = el("service").value;
      form.querySelectorAll("[data-show]").forEach(function (node) {
        var on = node.getAttribute("data-show").split(" ").indexOf(service) > -1;
        node.hidden = !on;
        node.querySelectorAll("input, select").forEach(function (i) { i.disabled = !on; });
      });
    }

    function quote() {
      var service = el("service").value;
      var make = currentMake();
      if (!make || !el("model").value) return null;
      var model = currentModel(make);
      var mobile = form.querySelector('input[name="where"]:checked').value === "mobile";
      var lines = [];
      var from = false;
      if (service === "spare") {
        var base = (model && model.spare) || make.spare;
        from = model && model.spare ? !!model.spareFrom : !!make.spareFrom;
        if (!model) from = true;
        lines.push(["Spare key, " + make.name, base]);
        var keys = Number(el("keys").value || 1);
        if (keys > 1) lines.push([(keys - 1) + " extra key" + (keys > 2 ? "s" : "") + " at " + gbp(C.extraKey) + " each", (keys - 1) * C.extraKey]);
      } else if (service === "akl") {
        var state = form.querySelector('input[name="state"]:checked').value;
        var akl = (model && model.akl) || make.akl || C.akl;
        if (!model) from = true;
        lines.push(["All keys lost, car " + state + ", " + make.name, akl[state]]);
      } else {
        lines.push(["CAN Phantom immobiliser, fitted", C.canPhantom.standalone]);
      }
      if (service !== "canphantom" && el("cp").checked) lines.push(["CAN Phantom at the same appointment", C.canPhantom.withKeys]);
      if (mobile) lines.push(["Mobile visit within 30 miles", C.mobileCharge]);
      var total = lines.reduce(function (s, l) { return s + l[1]; }, 0);
      return { lines: lines, total: total, from: from, mobile: mobile, make: make, model: model };
    }

    function update() {
      toggle();
      var q = quote();
      var contact = form.querySelector(".b-contact");
      if (contact) contact.hidden = !q;
      if (!q) {
        priceBox.innerHTML = '<p class="b-empty">Choose what you need, the make and the model to see your price.</p>';
        return;
      }
      var rows = q.lines.map(function (l) { return "<tr><td>" + l[0] + "</td><td>" + gbp(l[1]) + "</td></tr>"; }).join("");
      var note = q.from
        ? "Starting price. We confirm the exact figure from a photo of your key before booking."
        : "Fixed price, confirmed before booking.";
      priceBox.innerHTML = '<table class="b-lines"><tbody>' + rows + "</tbody></table>" +
        '<p class="b-total"><span>' + (q.from ? "Your price from" : "Your price") + "</span><strong>" + gbp(q.total) + "</strong></p>" +
        '<p class="b-note">' + note + "</p>";
    }

    function message() {
      var q = quote();
      var get = function (n) { return el(n) && el(n).value ? el(n).value.trim() : ""; };
      var modelName = q.model ? q.model.name : (get("model") === OTHER ? "Model not listed" : "");
      var out = [
        "Quote request from premiumcarkeys.co.uk",
        "Service: " + SERVICE_NAMES[get("service")],
        "Vehicle: " + q.make.name + ", " + modelName,
        "Registration: " + get("reg"),
        "Visit: " + (q.mobile ? "Mobile visit" : "Workshop in Halesowen"),
        "Postcode: " + get("postcode")
      ];
      q.lines.forEach(function (l) { out.push("  " + l[0] + ": " + gbp(l[1])); });
      out.push((q.from ? "Price from: " : "Price: ") + gbp(q.total));
      out.push("Name: " + get("name"));
      out.push("Phone: " + get("phone"));
      if (get("email")) out.push("Email: " + get("email"));
      if (get("message")) out.push("Notes: " + get("message"));
      return out.join("\n");
    }

    function ready() {
      if (!form.checkValidity()) { form.reportValidity(); return false; }
      return true;
    }

    el("service").addEventListener("change", fillMakes);
    el("make").addEventListener("change", function () { el("model").value = ""; fillModels(); });
    form.addEventListener("change", function (e) {
      if (e.target.name !== "service" && e.target.name !== "make") update();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!ready()) return;
      var text = message() + "\nI will send a photo of my key next.";
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      status.textContent = "WhatsApp opened with your quote filled in. Press send there, then attach a photo of your key.";
    });

    form.querySelector("[data-email]").addEventListener("click", function () {
      if (!ready()) return;
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Car key quote request") +
        "&body=" + encodeURIComponent(message() + "\nI will reply with a photo of my key.");
      status.textContent = "Your email app opened with your quote filled in. Press send there.";
    });

    fillMakes();
  });
})();
