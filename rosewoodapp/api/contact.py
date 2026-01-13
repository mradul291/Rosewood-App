import frappe

@frappe.whitelist()
def check_duplicate_contact_mobile(mobile, current_contact=None):
    if not mobile:
        return {"duplicate": False}

    values = {"mobile": mobile}
    conditions = ""

    if current_contact:
        conditions = "AND c.name != %(current_contact)s"
        values["current_contact"] = current_contact

    result = frappe.db.sql(
        f"""
        SELECT
            c.name,
            c.first_name,
            c.last_name
        FROM `tabContact` c
        LEFT JOIN `tabContact Phone` cp ON cp.parent = c.name
        WHERE
            (c.mobile_no = %(mobile)s OR cp.phone = %(mobile)s)
            {conditions}
        LIMIT 1
        """,
        values,
        as_dict=True
    )

    if result:
        contact = result[0]
        full_name = " ".join(
            filter(None, [contact.first_name, contact.last_name])
        )

        return {
            "duplicate": True,
            "contact": {
                "name": contact.name,
                "contact_name": full_name or contact.name
            }
        }

    return {"duplicate": False}
