(function () {
  const container = document.getElementById("mini-window-container");
  const iframe = document.getElementById("mini-window-iframe");
  const titleEl = document.getElementById("mini-window-title");
  const closeBtn = document.getElementById("mini-window-close");

  window.openMiniWindow = function (url, title) {
    console.log("Opening mini window", url, title);
    if (!iframe || !container) return;
    titleEl.textContent = title || "Vorschau";
    iframe.src = url;
    container.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.closeMiniWindow = function () {
    if (!container) return;
    container.classList.remove("active");
    setTimeout(() => {
      if (!container.classList.contains("active")) {
        iframe.src = "about:blank";
      }
    }, 300);
    document.body.style.overflow = "";
  };

  // Event Delegation for triggers
  document.addEventListener("click", function (e) {
    const trigger = e.target.closest(".mini-window-trigger");
    if (trigger) {
      e.preventDefault();
      const url = trigger.getAttribute("data-url");
      const title = trigger.getAttribute("data-title");
      openMiniWindow(url, title);
    }
  });

  // Close listeners
  if (closeBtn) closeBtn.addEventListener("click", closeMiniWindow);

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMiniWindow();
  });

  if (container) {
    container.addEventListener("click", function (e) {
      if (e.target === container) closeMiniWindow();
    });
  }
})();
