frappe.listview_settings["Expense Entry"] = {
  formatters: {
    cash_in(val) {
      if (val && flt(val) > 0) {
        return `<span style="color: green;">${val}</span>`;
      }
      return val;
    },

    cash_out(val) {
      if (val && flt(val) > 0) {
        return `<span style="color: red;">${val}</span>`;
      }
      return val;
    },

    balance(val) {
      if (val && flt(val) > 0) {
        return `<span style="color: green;">${val}</span>`;
      }
      if (val && flt(val) < 0) {
        return `<span style="color: red;">${val}</span>`;
      }
      return val;
    },
  },
};
