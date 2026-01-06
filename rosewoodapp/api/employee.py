import frappe

@frappe.whitelist()
def check_duplicate_mobile(mobile, current_employee=None):
    if not mobile:
        return {"duplicate": False}

    # Exclude current employee while editing
    conditions = ""
    values = {"mobile": mobile}

    if current_employee:
        conditions = "AND name != %(current_employee)s"
        values["current_employee"] = current_employee

    result = frappe.db.sql(
        f"""
        SELECT name, employee_name
        FROM `tabEmployee`
        WHERE (cell_number = %(mobile)s OR mobile_no_2 = %(mobile)s)
        {conditions}
        LIMIT 1
        """,
        values,
        as_dict=True,
    )

    if result:
        return {
            "duplicate": True,
            "employee": result[0]
        }

    return {"duplicate": False}

@frappe.whitelist()
def check_unique_employee_field(fieldname, value, current_employee=None):
    if not value or fieldname not in ["aadhar_card_no", "pan_number"]:
        return {"duplicate": False}

    conditions = ""
    values = {
        "value": value,
        "fieldname": fieldname,
    }

    if current_employee:
        conditions = "AND name != %(current_employee)s"
        values["current_employee"] = current_employee

    result = frappe.db.sql(
        f"""
        SELECT name, employee_name
        FROM `tabEmployee`
        WHERE {fieldname} = %(value)s
        {conditions}
        LIMIT 1
        """,
        values,
        as_dict=True,
    )

    if result:
        return {
            "duplicate": True,
            "employee": result[0]
        }

    return {"duplicate": False}
