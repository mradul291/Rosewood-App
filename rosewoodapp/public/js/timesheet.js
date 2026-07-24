
frappe.ui.form.on("Timesheet Detail", {
    work_date(frm, cdt, cdn) {
        set_datetime_fields(frm, cdt, cdn);
    },
    start_time(frm, cdt, cdn) {
        set_datetime_fields(frm, cdt, cdn);
    },
    end_time(frm, cdt, cdn) {
        set_datetime_fields(frm, cdt, cdn);
    }
});

function set_datetime_fields(frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    if (!row.start_time || !row.end_time) return;

    frappe.model.set_value(
        cdt,
        cdn,
        "from_time",
       `${frappe.datetime.get_today()} ${row.start_time}`
    );

    frappe.model.set_value(
        cdt,
        cdn,
        "to_time",
        `${frappe.datetime.get_today()} ${row.end_time}`
    );
}