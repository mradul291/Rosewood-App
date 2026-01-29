// frappe.listview_settings["Expense Entry"] = {
//   hide_name_column: true,
//   hide_name_filter: true,

//   formatters: {
//     cash_in(val) {
//       if (val && flt(val) > 0) {
//         return `<span style="color: green;">${val}</span>`;
//       }
//       return val;
//     },

//     cash_out(val) {
//       if (val && flt(val) > 0) {
//         return `<span style="color: red;">${val}</span>`;
//       }
//       return val;
//     },

//     balance(val) {
//       if (val && flt(val) > 0) {
//         return `<span style="color: green;">${val}</span>`;
//       }
//       if (val && flt(val) < 0) {
//         return `<span style="color: red;">${val}</span>`;
//       }
//       return val;
//     },
//   },
// };

//

frappe.listview_settings["Expense Entry"] = {
  hide_name_column: true,
  hide_name_filter: true,

  formatters: {
    cash_in(val) {
      if (val && flt(val) > 0) {
        return `
          <span class="indicator-pill green">
            ${flt(val)}
          </span>
        `;
      }
      return "";
    },

    cash_out(val) {
      if (val && flt(val) > 0) {
        return `
          <span class="indicator-pill red">
            ${flt(val)}
          </span>
        `;
      }
      return "";
    },

    balance(val) {
      if (!val) return "";

      if (flt(val) > 0) {
        return `
          <span class="indicator-pill green">
            ${flt(val)}
          </span>
        `;
      }

      if (flt(val) < 0) {
        return `
          <span class="indicator-pill red">
            ${Math.abs(flt(val))}
          </span>
        `;
      }

      return val;
    },

    payment_mode(val) {
      if (!val) return "";

      if (val === "Cash") {
        return `
          <span class="indicator-pill green">
            ${val}
          </span>
        `;
      }

      if (val === "Online") {
        return `
          <span class="indicator-pill blue">
            ${val}
          </span>
        `;
      }

      return val;
    },
  },
};
