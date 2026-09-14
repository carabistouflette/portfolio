const explorer = document.querySelector<HTMLElement>("[data-tool-explorer]");

if (explorer) {
  const controls = explorer.querySelector<HTMLElement>("[data-tool-controls]")!;
  const search = explorer.querySelector<HTMLInputElement>("#tool-search")!;
  const categories = [...explorer.querySelectorAll<HTMLButtonElement>("[data-tool-category]")];
  const count = explorer.querySelector<HTMLElement>("[data-tool-count]")!;
  const empty = explorer.querySelector<HTMLElement>("[data-tool-empty]")!;
  const reset = explorer.querySelector<HTMLButtonElement>("[data-tool-reset]")!;
  const normalize = (text: string): string => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
  const groups = [...explorer.querySelectorAll<HTMLDetailsElement>("[data-tool-group]")].map((element) => {
    const items = [...element.querySelectorAll<HTMLLIElement>("[data-tool-name]")].map((item) => ({
      element: item,
      text: normalize(item.dataset.toolSearch!),
      name: item.dataset.toolName!,
    }));
    return {
      element,
      count: element.querySelector<HTMLElement>("[data-tool-group-count]")!,
      preview: element.querySelector<HTMLElement>("[data-tool-preview]")!,
      previewKey: `${items.slice(0, 3).map((item) => item.name).join("|")}:${items.length}`,
      items,
      savedOpen: element.open,
    };
  });
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  let category = "all";
  let filtering = false;

  const update = (): void => {
    const query = normalize(search.value);
    const terms = query.split(/\s+/).filter(Boolean);
    const nextFiltering = query !== "" || category !== "all";
    let matches = 0;
    for (const group of groups) {
      if (nextFiltering && !filtering) group.savedOpen = group.element.open;
      let groupMatches = 0;
      const previewNames: string[] = [];
      const inCategory = category === "all" || group.element.dataset.toolGroup === category;
      for (const item of group.items) {
        const match = inCategory && terms.every((term) => item.text.includes(term));
        item.element.hidden = !match;
        if (match) {
          groupMatches++;
          if (previewNames.length < 3) previewNames.push(item.name);
        }
      }
      group.count.textContent = String(groupMatches);
      const previewKey = `${previewNames.join("|")}:${groupMatches}`;
      if (previewKey !== group.previewKey) {
        const fragment = document.createDocumentFragment();
        for (const name of previewNames) {
          const item = group.items.find((item) => item.name === name)!;
          const label = document.createElement("span");
          label.className = "inline-flex items-center gap-3";
          const icon = item.element.querySelector("[data-tool-icon]")!.cloneNode(true) as Element;
          icon.setAttribute("class", "h-6 w-6 shrink-0 object-contain");
          label.append(icon, document.createTextNode(name));
          fragment.append(label);
        }
        if (groupMatches > 3) {
          const remaining = document.createElement("span");
          remaining.className = "font-mono text-xs text-muted";
          remaining.textContent = `+${groupMatches - 3}`;
          fragment.append(remaining);
        }
        group.preview.replaceChildren(fragment);
        group.previewKey = previewKey;
      }
      group.element.hidden = groupMatches === 0;
      if (nextFiltering && groupMatches > 0) group.element.open = true;
      else if (!nextFiltering && filtering) group.element.open = group.savedOpen;
      matches += groupMatches;
    }
    filtering = nextFiltering;
    empty.hidden = matches !== 0;
    reset.hidden = !nextFiltering;
    count.textContent = count.dataset.template!.replace("{count}", String(matches)).replace("{total}", String(total));
    for (const button of categories) button.setAttribute("aria-pressed", String(button.dataset.toolCategory === category));
  };


  search.addEventListener("input", update);
  for (const button of categories) button.addEventListener("click", () => {
    category = button.dataset.toolCategory!;
    update();
  });
  reset.addEventListener("click", () => {
    search.value = "";
    category = "all";
    update();
    search.focus();
  });
  update();
  controls.hidden = false;
}
