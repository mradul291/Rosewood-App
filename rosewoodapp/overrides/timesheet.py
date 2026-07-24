     
from frappe.utils import get_datetime, add_to_date, time_diff_in_hours


def validate_timesheet(doc, method=None):
    for row in doc.time_logs:
        if not row.get("work_date") or not row.get("start_time") or not row.get("end_time"):
            continue

        from_time = get_datetime(f"{row.work_date} {row.start_time}")
        to_time = get_datetime(f"{row.work_date} {row.end_time}")

        if to_time <= from_time:
            to_time = add_to_date(to_time, days=1)

        row.from_time = from_time
        row.to_time = to_time

        hours = time_diff_in_hours(to_time, from_time)
        row.hours = hours

        if row.get("is_billable"):
            row.billing_hours = hours