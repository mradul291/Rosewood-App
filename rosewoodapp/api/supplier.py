import frappe

@frappe.whitelist()
def sync_supplier_bank_account(doc, method):
    # Skip if required data missing
    if not doc.bank_name or not doc.bank_account_no:
        return

    # Resolve company
    company = None
    if hasattr(doc, "companies") and doc.companies:
        company = doc.companies[0].company
    else:
        company = frappe.defaults.get_user_default("Company")

    if not company:
        frappe.log_error(
            f"Supplier {doc.name} has no company set.",
            "Supplier Bank Sync Failed"
        )
        return

    # Check existing Bank Account for this supplier + company
    existing_accounts = frappe.get_all(
        "Bank Account",
        filters={
            "party_type": "Supplier",
            "party": doc.name,
            "company": company
        },
        fields=["name", "bank", "bank_account_no"],
        limit=1
    )

    # If exists, verify whether data changed
    if existing_accounts:
        existing = existing_accounts[0]

        # Fetch bank name for comparison
        existing_bank_name = frappe.db.get_value(
            "Bank",
            existing.bank,
            "bank_name"
        )

        # If nothing changed → do nothing
        if (
            existing.bank_account_no == doc.bank_account_no
            and existing_bank_name == doc.bank_name
        ):
            return

        # If changed → update existing Bank Account
        bank_link = get_or_create_bank(doc.bank_name)

        frappe.db.set_value(
            "Bank Account",
            existing.name,
            {
                "bank": bank_link,
                "bank_account_no": doc.bank_account_no
            }
        )

        return

    # No existing Bank Account → create new
    bank_link = get_or_create_bank(doc.bank_name)

    bank_account = frappe.get_doc({
        "doctype": "Bank Account",
        "account_name": doc.supplier_name,
        "bank": bank_link,
        "bank_account_no": doc.bank_account_no,
        "party_type": "Supplier",
        "party": doc.name,
        "company": company
    })

    bank_account.insert(ignore_permissions=True)

@frappe.whitelist()
def get_or_create_bank(bank_name):
    bank = frappe.get_all(
        "Bank",
        filters={"bank_name": bank_name},
        fields=["name"],
        limit=1
    )

    if bank:
        return bank[0].name

    bank_doc = frappe.get_doc({
        "doctype": "Bank",
        "bank_name": bank_name
    })
    bank_doc.insert(ignore_permissions=True)

    return bank_doc.name

@frappe.whitelist()
def global_supplier_search(search_text):
    if not search_text:
        return []

    search_text = f"%{search_text}%"

    fields = [
        "supplier_name",
        "alias",
        "supplier_category",
        "supplier_constitution",
        "bank_name",
        "bank_account_no",
        "gstin",
        "pan",
        "aadhar_number",
        "supplier_primary_address",
        "supplier_primary_contact",
        "mobile_no",
    ]

    conditions = " OR ".join([f"`{field}` LIKE %s" for field in fields])
    values = [search_text] * len(fields)

    query = f"""
        SELECT name
        FROM `tabSupplier`
        WHERE ({conditions})
        LIMIT 50
    """

    data = frappe.db.sql(query, values, as_dict=True)
    return [d.name for d in data]

@frappe.whitelist()
def check_duplicate_mobile(mobile, current_supplier=None):
    if not mobile:
        return {"duplicate": False}

    conditions = ""
    values = {"mobile": mobile}

    if current_supplier:
        conditions = "AND name != %(current_supplier)s"
        values["current_supplier"] = current_supplier

    result = frappe.db.sql(
        f"""
        SELECT name, supplier_name
        FROM `tabSupplier`
        WHERE mobile_number = %(mobile)s
        {conditions}
        LIMIT 1
        """,
        values,
        as_dict=True,
    )

    if result:
        return {
            "duplicate": True,
            "supplier": result[0]
        }

    return {"duplicate": False}
