import frappe

@frappe.whitelist()
def global_asset_search(search_text):
    if not search_text:
        return []

    search_text = f"%{search_text}%"

    # ONLY fields that actually contain searchable data
    fields = [
        "location",
        "city",
        "state",
        "item_name",
        "working_table_size",
        "make",
        "designation",
        "description",
        "owner_name",
        "type",
        "model",
        "ref_no",
        "serial_reg_no",
        "max_workpiece_thickness",
        "capacity",
        "chuck_diameter",
        "cfm",
        "hp",
        "max_depth",
        "max_depth_unit",
        "max_final_pressure",
        "motor_power",
        "rpm_max",
        "class",
        "rated_voltage",
        "amp",
        "eff",
        "pf",
        "rated_frequency",
        "duty",
        "phase",
        "start_capacitor",
        "run_capacitor",
        "rated_input_power",
        "mac_id",
        "maft_id",
        "default_ip_address",
        "username",
        "execute_standard",
        "fr",
        "custodian",
        "status",
        "remarks",
    ]

    conditions = " OR ".join([f"`{field}` LIKE %s" for field in fields])
    values = [search_text] * len(fields)

    query = f"""
        SELECT name
        FROM `tabAsset Management`
        WHERE ({conditions})
        ORDER BY modified DESC
        LIMIT 50
    """

    data = frappe.db.sql(query, values, as_dict=True)
    return [d.name for d in data]

def create_item_and_asset(doc, method):
	if not doc.item_name:
		return

	item_code = doc.item_name.strip()

	# -----------------------------
	# STEP 1: Create Item (if not exists)
	# -----------------------------
	if not frappe.db.exists("Item", item_code):
		item = frappe.get_doc({
			"doctype": "Item",
			"item_code": item_code,
			"item_name": item_code,
			"item_group": "Products",
			"stock_uom": "Nos",
			"asset_category": "Products",
			"is_stock_item": 0,
            "is_fixed_asset": 1,
		})

		item.flags.ignore_mandatory = True
		item.flags.ignore_validate = True
		item.insert(ignore_permissions=True)

	# -----------------------------
	# STEP 2: Create Asset (if not exists)
	# -----------------------------
	if not frappe.db.exists("Asset", {"item_code": item_code}):
		asset = frappe.get_doc({
			"doctype": "Asset",
			"item_code": item_code,
			"item_name": item_code,
			"asset_name": item_code,
			"asset_category": "Products",
			"available_for_use_date": frappe.utils.today(),
			"company": doc.company if hasattr(doc, "company") else frappe.defaults.get_global_default("company"),
		})

		asset.flags.ignore_mandatory = True
		asset.flags.ignore_validate = True
		asset.insert(ignore_permissions=True)

	frappe.db.commit()
