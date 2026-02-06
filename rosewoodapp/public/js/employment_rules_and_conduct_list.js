frappe.listview_settings["Employment Rules and Conduct"] = {
	onload(listview) {
		const route = frappe.get_route_str();

		frappe.breadcrumbs.all[route] = {
			workspace: "HR",
			doctype: listview.doctype,
			type: "List",
		};

		frappe.breadcrumbs.update();
	},
};
