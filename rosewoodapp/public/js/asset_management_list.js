frappe.listview_settings["Asset Management"] = {
  onload(listview) {
    // Create raw search input
    const $search = $(`
      <input type="text"
        class="form-control"
        placeholder="Search assets by any detail...">
    `);

    // Attach to listview header
    listview.page.page_form.append($search);

    let debounce_timer = null;

    $search.on("input", function () {
      const value = $(this).val();
      clearTimeout(debounce_timer);

      debounce_timer = setTimeout(() => {
        if (!value) {
          listview.filter_area.clear();
          listview.refresh();
          return;
        }

        frappe.call({
          method: "rosewoodapp.api.asset_management.global_asset_search",
          args: {
            search_text: value,
          },
          callback(r) {
            listview.filter_area.clear();

            if (r.message && r.message.length) {
              listview.filter_area.add([
                ["Asset Management", "name", "in", r.message],
              ]);
            }

            listview.refresh();
          },
        });
      }, 400);
    });

    // ALT + G → focus search
    $(document).on("keydown", function (e) {
      if (e.altKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        e.stopPropagation();
        $search.focus();
      }
    });
  },
};
