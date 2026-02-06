frappe.ui.form.on("Asset Management", {
	refresh(frm) {
		const route = frappe.get_route_str();

		frappe.breadcrumbs.all[route] = {
			workspace: "Asset MGMT",
			doctype: frm.doctype,
			type: "Form",
		};

		frappe.breadcrumbs.update();
	},
});
