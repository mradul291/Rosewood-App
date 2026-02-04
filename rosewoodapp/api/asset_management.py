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
