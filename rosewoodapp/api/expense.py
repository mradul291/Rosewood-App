import frappe

@frappe.whitelist()
def get_or_create_person_category(base_category, person_name, entry_type):
	if not base_category or not person_name:
		frappe.throw("Base Category and Person Name are required")

	sub_category_name = f"{base_category} - {person_name.strip()}"

	# If exists, return
	if frappe.db.exists("Expense Category", sub_category_name):
		return sub_category_name

	# Create new sub-category
	doc = frappe.get_doc({
		"doctype": "Expense Category",
		"category_name": sub_category_name,
		"entry_type": entry_type,
		"parent_category": base_category,
		"is_active": 1,
		"requires_person": 0,
	})

	doc.insert(ignore_permissions=True)
	frappe.db.commit()

	return doc.name
