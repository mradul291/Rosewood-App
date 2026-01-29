import requests
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

def build_full_name_with_village(doc, method=None):
    
    if doc.allow_manual_full_name_with_village:
        return

    def proper(val):
        if not val:
            return ""
        return " ".join(word.capitalize() for word in val.strip().split())

    first = proper(doc.first_name)
    father = proper(doc.fathers_name.split(" ")[0]) if doc.fathers_name else ""
    last = proper(doc.last_name)
    village = proper(doc.village_name)

    parts = [first, father, last, village]
    parts = [p for p in parts if p]

    doc.full_name_with_village_name = " ".join(parts)

@frappe.whitelist()
def global_employee_search(search_text):
    if not search_text:
        return []

    search_text = f"%{search_text}%"

    fields = [
        "employee",
        "first_name",
        "last_name",
        "employee_name",
        "fathers_name",
        "alias",
        "full_name_with_village_name",
        "spouse_first_name",
        "spouse_last_name",
        "cell_number",
        "mobile_no_2",
        "aadhar_card_no",
        "personal_email",
        "company_email",
        "village_name",
        "pan_number",
        "reference_name_for_joining",
        "current_address",
        "permanent_address",
        "ifsc_code",
        "bank_ac_no",
        "micr_code",
        "bank_name",
        "branch_name"
    ]

    conditions = " OR ".join([f"`{field}` LIKE %s" for field in fields])
    values = [search_text] * len(fields)

    query = f"""
        SELECT name
        FROM `tabEmployee`
        WHERE ({conditions})
        LIMIT 50
    """

    data = frappe.db.sql(query, values, as_dict=True)
    return [d.name for d in data]

@frappe.whitelist()
def fetch_ifsc_details(ifsc_code):
    if not ifsc_code:
        return {}

    url = f"https://ifsc.razorpay.com/{ifsc_code}"

    try:
        response = requests.get(url, timeout=10)

        # Razorpay returns 404 for invalid IFSC
        if response.status_code != 200:
            frappe.throw("Invalid IFSC Code")

        data = response.json()

        # Build a clean, readable address
        address_parts = [
            data.get("BRANCH"),
            data.get("ADDRESS"),
            data.get("CITY") or data.get("DISTRICT"),
            data.get("STATE"),
            "India"
        ]

        # Remove empty values and duplicates while preserving order
        clean_address = []
        for part in address_parts:
            if part and part not in clean_address:
                clean_address.append(part.strip())

        return {
            "bank_name": data.get("BANK"),
            "branch_name": data.get("BRANCH"),
            "branch_address": ", ".join(clean_address),
            "micr_code": data.get("MICR")
        }

    except frappe.ValidationError:
        raise

    except Exception:
        frappe.log_error(frappe.get_traceback(), "IFSC Fetch Failed")
        frappe.throw("Unable to fetch bank details")
