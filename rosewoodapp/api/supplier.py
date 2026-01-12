import frappe

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
