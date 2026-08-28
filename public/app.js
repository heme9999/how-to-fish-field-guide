const tracker = document.querySelector("[data-tracker]");

if (tracker) {
  const storageKey = "htf-fishipedia-v1";
  const boxes = [...tracker.querySelectorAll("input[type=checkbox]")];
  const search = document.querySelector("[data-search]");
  const filter = document.querySelector("[data-filter]");
  const count = document.querySelector("[data-count]");
  const bar = document.querySelector("[data-progress]");
  const progressbar = document.querySelector("[data-progressbar]");
  const reset = document.querySelector("[data-reset]");
  const toast = document.querySelector("[data-toast]");
  const empty = document.querySelector("[data-empty]");
  let saved = {};

  try { saved = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { saved = {}; }

  function renderProgress() {
    const complete = boxes.filter((box) => box.checked).length;
    count.textContent = `${complete} of ${boxes.length} tracked entries complete`;
    bar.style.width = `${Math.round((complete / boxes.length) * 100)}%`;
    progressbar?.setAttribute("aria-valuenow", String(complete));
    progressbar?.setAttribute("aria-valuetext", `${complete} of ${boxes.length} entries complete`);
  }

  function applyFilters() {
    const query = (search?.value || "").toLowerCase().trim();
    const state = filter?.value || "all";
    let visible = 0;
    boxes.forEach((box) => {
      const item = box.closest(".check-item");
      const matchesQuery = item.textContent.toLowerCase().includes(query);
      const matchesState = state === "all" || (state === "done" ? box.checked : !box.checked);
      item.classList.toggle("hidden", !(matchesQuery && matchesState));
      if (matchesQuery && matchesState) visible += 1;
    });
    empty?.classList.toggle("hidden", visible !== 0);
  }

  boxes.forEach((box) => {
    box.checked = Boolean(saved[box.value]);
    box.closest(".check-item").classList.toggle("checked", box.checked);
    box.addEventListener("change", () => {
      saved[box.value] = box.checked;
      localStorage.setItem(storageKey, JSON.stringify(saved));
      box.closest(".check-item").classList.toggle("checked", box.checked);
      renderProgress();
      applyFilters();
      if (toast) toast.textContent = `${box.closest(".check-item").querySelector("strong").textContent} ${box.checked ? "marked caught" : "marked not caught"}.`;
    });
  });
  search?.addEventListener("input", applyFilters);
  filter?.addEventListener("change", applyFilters);
  reset?.addEventListener("click", () => {
    if (!window.confirm("Reset all Fishipedia progress on this device?")) return;
    boxes.forEach((box) => {
      box.checked = false;
      box.closest(".check-item").classList.remove("checked");
    });
    localStorage.removeItem(storageKey);
    renderProgress();
    applyFilters();
    if (toast) toast.textContent = "Fishipedia progress reset.";
  });
  renderProgress();
  applyFilters();
}
