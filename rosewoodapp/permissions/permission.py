import frappe

def expense_entry_permission_query(user):
    if "System Manager" in frappe.get_roles(user):
        return None  # No restriction

    return f"`tabExpense Entry`.entry_by = '{user}'"

def expense_entry_has_permission(doc, user):
    if "System Manager" in frappe.get_roles(user):
        return True

    return doc.entry_by == user
