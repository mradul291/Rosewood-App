// -------------------------------
// Default values on load
// -------------------------------
frappe.ui.form.on("Expense Entry", {
	onload(frm) {
		if (!frm.doc.posting_date) {
			frm.set_value("posting_date", frappe.datetime.get_today());
		}

		if (!frm.doc.posting_time) {
			frm.set_value("posting_time", frappe.datetime.now_datetime());
		}

		if (!frm.doc.entry_by) {
			frm.set_value("entry_by", frappe.session.user);
		}
	},
});

// -------------------------------
// Entry Type control logic
// -------------------------------
frappe.ui.form.on("Expense Entry", {
	entry_type(frm) {
		frm.set_value("cash_in", 0);
		frm.set_value("cash_out", 0);
		frm.set_value("expense_category", null);

		if (frm.doc.entry_type === "Opening Balance" || frm.doc.entry_type === "Inward") {
			frm.set_df_property("cash_in", "read_only", 0);
			frm.set_df_property("cash_out", "read_only", 1);
		}

		if (frm.doc.entry_type === "Outward") {
			frm.set_df_property("cash_out", "read_only", 0);
			frm.set_df_property("cash_in", "read_only", 1);
		}

		apply_category_filter(frm);
	},
});

// -------------------------------
// Category filter by Entry Type
// -------------------------------
function apply_category_filter(frm) {
	frm.set_query("expense_category", function () {
		return {
			filters: {
				entry_type: frm.doc.entry_type,
				is_active: 1,
			},
		};
	});
}

// -------------------------------
// Validation rules
// -------------------------------
frappe.ui.form.on("Expense Entry", {
	validate(frm) {
		if (frm.doc.entry_type === "Outward" && frm.doc.cash_in > 0) {
			frappe.throw("Cash In is not allowed for Outward entries.");
		}

		if (
			(frm.doc.entry_type === "Inward" || frm.doc.entry_type === "Opening Balance") &&
			frm.doc.cash_out > 0
		) {
			frappe.throw("Cash Out is not allowed for Inward / Opening Balance entries.");
		}

		if ((frm.doc.cash_in || 0) === 0 && (frm.doc.cash_out || 0) === 0) {
			frappe.throw("Either Cash In or Cash Out must be greater than zero.");
		}
	},
});

// -------------------------------
// Auto balance calculation
// -------------------------------
frappe.ui.form.on("Expense Entry", {
	before_save(frm) {
		return frappe.db
			.get_list("Expense Entry", {
				fields: ["balance"],
				order_by: "posting_date desc, posting_time desc",
				limit: 1,
			})
			.then((res) => {
				let previous_balance = res.length ? res[0].balance : 0;
				let current_balance =
					previous_balance + (frm.doc.cash_in || 0) - (frm.doc.cash_out || 0);

				frm.set_value("balance", current_balance);
			});
	},
});

// -------------------------------
// Opening Balance allowed only once
// -------------------------------
frappe.ui.form.on("Expense Entry", {
	validate(frm) {
		if (frm.doc.entry_type === "Opening Balance" && frm.is_new()) {
			return frappe.db
				.count("Expense Entry", {
					entry_type: "Opening Balance",
				})
				.then((count) => {
					if (count > 0) {
						frappe.throw("Opening Balance has already been created.");
					}
				});
		}
	},
});

// -------------------------------
// UI polish
// -------------------------------
frappe.ui.form.on("Expense Entry", {
	refresh(frm) {
		frm.set_df_property("balance", "read_only", 1);
	},
});
