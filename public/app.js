const tracker = document.querySelector("[data-tracker]");

if (tracker) {
  const storageKey = "htf-fishipedia-v1";
  const boxes = [...tracker.querySelectorAll("input[type=checkbox]")];
  const search = document.querySelector("[data-search]");
  const filter = document.querySelector("[data-filter]");
  const gearFilter = document.querySelector("[data-gear-filter]");
  const count = document.querySelector("[data-count]");
  const bar = document.querySelector("[data-progress]");
  const progressbar = document.querySelector("[data-progressbar]");
  const reset = document.querySelector("[data-reset]");
  const toast = document.querySelector("[data-toast]");
  const empty = document.querySelector("[data-empty]");
  const exportButton = document.querySelector("[data-export]");
  const importInput = document.querySelector("[data-import]");
  let saved = {};

  try { saved = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { saved = {}; }

  function renderProgress() {
    const complete = boxes.filter((box) => box.checked).length;
    count.textContent = `${complete} of ${boxes.length} tracked entries complete`;
    bar.style.width = `${Math.round((complete / boxes.length) * 100)}%`;
    progressbar?.setAttribute("aria-valuenow", String(complete));
    progressbar?.setAttribute("aria-valuetext", `${complete} of ${boxes.length} entries complete`);
    if (reset) reset.disabled = complete === 0;
  }

  function applyFilters() {
    const query = (search?.value || "").toLowerCase().trim();
    const state = filter?.value || "all";
    const gear = gearFilter?.value || "all";
    let visible = 0;
    boxes.forEach((box) => {
      const item = box.closest(".check-item");
      const matchesQuery = item.textContent.toLowerCase().includes(query);
      const matchesState = state === "all" || (state === "done" ? box.checked : !box.checked);
      const matchesGear = gear === "all" || item.dataset.gear === gear;
      item.classList.toggle("hidden", !(matchesQuery && matchesState && matchesGear));
      if (matchesQuery && matchesState && matchesGear) visible += 1;
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
  gearFilter?.addEventListener("change", applyFilters);
  exportButton?.addEventListener("click", () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), caught: boxes.filter((box) => box.checked).map((box) => box.value) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "how-to-fish-tracker-backup.json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (toast) toast.textContent = `Backup exported with ${payload.caught.length} caught entries.`;
  });
  importInput?.addEventListener("change", async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (payload.version !== 1 || !Array.isArray(payload.caught)) throw new Error("Invalid backup");
      const valid = new Set(boxes.map((box) => box.value));
      const caught = new Set(payload.caught.filter((value) => valid.has(value)));
      boxes.forEach((box) => {
        box.checked = caught.has(box.value);
        box.closest(".check-item").classList.toggle("checked", box.checked);
        saved[box.value] = box.checked;
      });
      localStorage.setItem(storageKey, JSON.stringify(saved));
      renderProgress();
      applyFilters();
      if (toast) toast.textContent = `Backup imported: ${caught.size} caught entries restored.`;
    } catch {
      if (toast) toast.textContent = "That file is not a valid Fishipedia backup.";
    } finally {
      importInput.value = "";
    }
  });
  reset?.addEventListener("click", () => {
    if (!window.confirm("Reset all Fishipedia progress on this device?")) return;
    boxes.forEach((box) => {
      box.checked = false;
      box.closest(".check-item").classList.remove("checked");
    });
    if (search) search.value = "";
    if (filter) filter.value = "all";
    if (gearFilter) gearFilter.value = "all";
    localStorage.removeItem(storageKey);
    renderProgress();
    applyFilters();
    if (toast) toast.textContent = "Fishipedia progress reset.";
  });
  renderProgress();
  applyFilters();
}
