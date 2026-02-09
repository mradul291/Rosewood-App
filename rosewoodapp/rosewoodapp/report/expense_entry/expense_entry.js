frappe.query_reports["Expense Entry"] = {
	filters: [
		{
			fieldname: "from_date",
			label: __("From Date"),
			fieldtype: "Date",
			default: frappe.datetime.month_start(),
			reqd: 1,
		},
		{
			fieldname: "to_date",
			label: __("To Date"),
			fieldtype: "Date",
			default: frappe.datetime.month_end(),
			reqd: 1,
		},
		{
			fieldname: "entry_type",
			label: __("Type of Entry"),
			fieldtype: "Select",
			options: "\nOpening Balance\nInward\nOutward",
		},
		{
			fieldname: "expense_category",
			label: __("Category"),
			fieldtype: "Link",
			options: "Expense Category",
		},
		{
			fieldname: "payment_mode",
			label: __("Mode of Transaction"),
			fieldtype: "Select",
			options: "\nCash\nOnline",
		},
		{
			fieldname: "site",
			label: __("Place (Site)"),
			fieldtype: "Link",
			options: "Site",
		},
		{
			fieldname: "entry_by",
			label: __("Entry By"),
			fieldtype: "Link",
			options: "User",
		},
	],

	// -------------------------------
	// Filter dependency logic
	// -------------------------------
	onload(report) {
		// Apply initial category filter (in case entry_type already has value)
		set_category_filter(report);
	},

	on_change(report) {
		// Triggered when any filter changes
		set_category_filter(report);
	},
};

// -------------------------------
// Category filter by Entry Type
// -------------------------------
function set_category_filter(report) {
	const entry_type = report.get_filter_value("entry_type");

	const category_filter = report.get_filter("expense_category");
	if (!category_filter) return;

	category_filter.df.get_query = function () {
		return {
			filters: {
				entry_type: entry_type || undefined,
				is_active: 1,
			},
		};
	};

	// Clear category if entry type changes
	if (!entry_type) {
		report.set_filter_value("expense_category", "");
	}
}
