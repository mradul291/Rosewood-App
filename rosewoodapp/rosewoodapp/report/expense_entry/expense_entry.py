# Copyright (c) 2026, Chirag Joshi and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()
    data = get_data(filters)

    return columns, data


def get_columns():
    return [
        {"label": "Date", "fieldname": "posting_date", "fieldtype": "Date", "width": 100},
        {"label": "Time", "fieldname": "posting_time", "fieldtype": "Datetime", "width": 120},
        {"label": "Entry Type", "fieldname": "entry_type", "fieldtype": "Data", "width": 120},
        {"label": "Category", "fieldname": "expense_category", "fieldtype": "Data", "width": 160},
        {"label": "Payment Mode", "fieldname": "payment_mode", "fieldtype": "Data", "width": 120},
        {"label": "Site", "fieldname": "site", "fieldtype": "Data", "width": 140},
        {"label": "Cash In", "fieldname": "cash_in", "fieldtype": "Currency", "width": 110},
        {"label": "Cash Out", "fieldname": "cash_out", "fieldtype": "Currency", "width": 110},
        {"label": "Balance", "fieldname": "balance", "fieldtype": "Currency", "width": 110},
        {"label": "Entry By", "fieldname": "entry_by", "fieldtype": "Data", "width": 120},
        {"label": "Entry Person", "fieldname": "entry_person", "fieldtype": "Data", "width": 120},
        {"label": "Remarks", "fieldname": "description", "fieldtype": "Data", "width": 200},
    ]


def get_data(filters):
    conditions = []
    values = {}

    # Date range (MANDATORY)
    conditions.append("posting_date BETWEEN %(from_date)s AND %(to_date)s")
    values["from_date"] = filters.get("from_date")
    values["to_date"] = filters.get("to_date")

    # Optional filters
    if filters.get("entry_type"):
        conditions.append("entry_type = %(entry_type)s")
        values["entry_type"] = filters.get("entry_type")

    if filters.get("expense_category"):
        conditions.append("expense_category = %(expense_category)s")
        values["expense_category"] = filters.get("expense_category")

    if filters.get("payment_mode"):
        conditions.append("payment_mode = %(payment_mode)s")
        values["payment_mode"] = filters.get("payment_mode")

    if filters.get("site"):
        conditions.append("site = %(site)s")
        values["site"] = filters.get("site")

    if filters.get("entry_by"):
        conditions.append("entry_by = %(entry_by)s")
        values["entry_by"] = filters.get("entry_by")

    where_clause = " AND ".join(conditions)

    query = f"""
        SELECT
            posting_date,
            posting_time,
            entry_type,
            expense_category,
            payment_mode,
            site,
            cash_in,
            cash_out,
            balance,
            entry_by,
            entry_person,
            description
        FROM
            `tabExpense Entry`
        WHERE
            docstatus < 2
            AND {where_clause}
        ORDER BY
            posting_date ASC,
            posting_time ASC
    """

    return frappe.db.sql(query, values, as_dict=True)
