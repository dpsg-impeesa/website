!(function () {
  var t =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  let e = document.currentScript;
  const a = new URLSearchParams();
  a.set("frameId", t),
    a.set("embed", "1"),
    e.dataset.division && a.set("division", e.dataset.division);
  var o = e.dataset.slug,
    o =
      (e.dataset.baseurl || "https://on.campflow.de/") + o + "?" + a.toString();
  let r = document.createElement("iframe");
  (r.src = o),
    (r.width = "100%"),
    (r.frameBorder = "none"),
    (r.style.overflow = "hidden"),
    (r.scrolling = "no"),
    "1" === e.dataset.transparent
      ? ((r.style.backgroundColor = "transparent"), (r.allowTransparency = !0))
      : (r.style.backgroundColor = "var(--background-color)"),
    e.parentNode.insertBefore(r, e),
    addEventListener("message", function (e) {
      if (e.data.frameId === t)
        switch (
          (console.debug(
            "Received iframe message",
            e.data.type,
            e.data.payloadType
          ),
          e.data.type)
        ) {
          case void 0:
          case "resize":
            r.style.height = e.data.height + "px";
            break;
          case "scroll":
            window.scrollTo({
              top: r.offsetTop + e.data.top,
              behavior: "smooth",
            });
            break;
          default:
            console.warn("Unknown iframe message type", e.data.type);
        }
    });
})();
