frappe.listview_settings["Supplier"] = {
  onload(listview) {
    // Create raw input (not a Frappe field)
    const $search = $(`
      <input type="text"
        class="form-control"
        placeholder="Search suppliers by any detail...">
    `);

    // Attach input to listview header
    listview.page.page_form.append($search);

    let debounce_timer = null;

    $search.on("input", function () {
      const value = $(this).val();

      clearTimeout(debounce_timer);

      debounce_timer = setTimeout(() => {
        // Reset list if empty
        if (!value) {
          listview.filter_area.clear();
          listview.refresh();
          return;
        }

        frappe.call({
          method: "rosewoodapp.api.supplier.global_supplier_search",
          args: {
            search_text: value,
          },
          callback(r) {
            listview.filter_area.clear();

            if (r.message && r.message.length) {
              listview.filter_area.add([["Supplier", "name", "in", r.message]]);
            }

            listview.refresh();
          },
        });
      }, 400); // debounce delay
    });

    // ---------------------------------------
    // CTRL + SHIFT + G Shortcut → Focus Search Input
    // ---------------------------------------
    $(document).on("keydown", function (e) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        e.stopPropagation();
        $search.focus();
      }
    });
  },
};
