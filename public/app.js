const tracker = document.querySelector("[data-tracker]");

if (tracker) {
  const storageKey = "htf-fishipedia-v1";
  const boxes = [...tracker.querySelectorAll("input[type=checkbox]")];
  const search = document.querySelector("[data-search]");
  const filter = document.querySelector("[data-filter]");
  const count = document.querySelector("[data-count]");
  const bar = document.querySelector("[data-progress]");
  let saved = {};

  try { saved = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { saved = {}; }

  function renderProgress() {
    const complete = boxes.filter((box) => box.checked).length;
    count.textContent = `${complete} of ${boxes.length} tracked entries complete`;
    bar.style.width = `${Math.round((complete / boxes.length) * 100)}%`;
  }

  function applyFilters() {
    const query = (search?.value || "").toLowerCase().trim();
    const state = filter?.value || "all";
    boxes.forEach((box) => {
      const item = box.closest(".check-item");
      const matchesQuery = item.textContent.toLowerCase().includes(query);
      const matchesState = state === "all" || (state === "done" ? box.checked : !box.checked);
      item.classList.toggle("hidden", !(matchesQuery && matchesState));
    });
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
    });
  });
  search?.addEventListener("input", applyFilters);
  filter?.addEventListener("change", applyFilters);
  renderProgress();
}
