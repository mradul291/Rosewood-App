// frappe.query_reports["Expense Summary - Site Wise"] = {
//     formatter: function (value, row, column, data, default_formatter) {
//         value = default_formatter(value, row, column, data);

//         // Cash In → Green
//         if (column.fieldname === "cash_in" && data.cash_in > 0) {
//             value = `<span style="color: green; font-weight: 600;">${value}</span>`;
//         }

//         // Cash Out → Red
//         if (column.fieldname === "cash_out" && data.cash_out > 0) {
//             value = `<span style="color: red; font-weight: 600;">${value}</span>`;
//         }

//         // Balance → Green if positive, Red if negative
//         if (column.fieldname === "balance") {
//             if (data.balance > 0) {
//                 value = `<span style="color: green; font-weight: 600;">${value}</span>`;
//             } else if (data.balance < 0) {
//                 value = `<span style="color: red; font-weight: 600;">${value}</span>`;
//             }
//         }

//         return value;
//     }
// };
