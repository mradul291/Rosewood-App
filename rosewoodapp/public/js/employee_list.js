frappe.listview_settings["Employee"] = {
  onload(listview) {
    // Create raw input (NOT a Frappe field)
    const $search = $(`
      <input type="text"
        class="form-control"
        placeholder="Search employees by any detail...">
    `);

    // Attach to page
    listview.page.page_form.append($search);

    // ---------------------------------------
    // ALT + G Shortcut → Focus Search Input
    // ---------------------------------------
    $(document).on("keydown", function (e) {
      if (
        e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === "g"
      ) {
        e.preventDefault();
        e.stopPropagation();
        $search.focus();
      }
    });

    let debounce_timer = null;

    $search.on("input", function () {
      const value = $(this).val();

      clearTimeout(debounce_timer);

      debounce_timer = setTimeout(() => {
        // Clear filter if empty
        if (!value) {
          listview.filter_area.clear();
          listview.refresh();
          return;
        }

        frappe.call({
          method: "rosewoodapp.api.employee.global_employee_search",
          args: { search_text: value },
          callback(r) {
            listview.filter_area.clear();

            if (r.message && r.message.length) {
              listview.filter_area.add([["Employee", "name", "in", r.message]]);
            }

            listview.refresh();
          },
        });
      }, 400);
    });
  },
};
