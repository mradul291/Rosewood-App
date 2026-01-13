frappe.ui.form.on("Contact", {
  mobile_no(frm) {
    check_duplicate_contact_mobile(frm, frm.doc.mobile_no);
  },
});

// Child table handler
frappe.ui.form.on("Contact Phone", {
  phone(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    check_duplicate_contact_mobile(frm, row.phone);
  },
});

function check_duplicate_contact_mobile(frm, mobile) {
  if (!mobile || mobile.length !== 10) return;

  if (!/^\d{10}$/.test(mobile)) {
    frappe.msgprint(__("Mobile Number must be exactly 10 digits."));
    return;
  }

  frappe.call({
    method: "rosewoodapp.api.contact.check_duplicate_contact_mobile",
    args: {
      mobile: mobile,
      current_contact: frm.doc.name,
    },
    callback(r) {
      if (!r.message || !r.message.duplicate) return;

      const c = r.message.contact;

      frappe.confirm(
        __(
          `This Mobile Number is already used by Contact:<br><br>
           <b>${c.contact_name}</b> (${c.name})<br><br>
           Do you want to allow duplicate entry?`
        ),
        () => {
          // Allowed → do nothing
        },
        () => {
          // Rejected → clear value
          clear_mobile_value(frm, mobile);
        }
      );
    },
  });
}

function clear_mobile_value(frm, mobile) {
  // Clear from main field
  if (frm.doc.mobile_no === mobile) {
    frm.set_value("mobile_no", "");
    return;
  }

  // Clear from child table
  (frm.doc.phone_nos || []).forEach((row) => {
    if (row.phone === mobile) {
      frappe.model.set_value(row.doctype, row.name, "phone", "");
    }
  });
}
