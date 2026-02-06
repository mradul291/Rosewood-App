frappe.listview_settings["Asset Management"] = {
	onload(listview) {
		const route = frappe.get_route_str();

		frappe.breadcrumbs.all[route] = {
			workspace: "Asset MGMT",
			doctype: listview.doctype,
			type: "List",
		};

		frappe.breadcrumbs.update();
	},
};
