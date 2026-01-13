frappe.ui.form.on("Address", {
  pincode(frm) {
    const pin = frm.doc.pincode;

    if (!pin || pin.length !== 6) return;

    if (!/^\d{6}$/.test(pin)) {
      frappe.msgprint(__("PIN Code must be exactly 6 digits."));
      return;
    }

    // Optional: Add loading indicator
    frm.dashboard.show_loading();

    frappe.call({
      method: "rosewoodapp.api.address.get_location_from_pincode",
      args: { pincode: pin },
      callback(r) {
        frm.dashboard.clear_comment(); // Clear loading

        if (r.message) {
          frm.set_value("city", r.message.city);
          frm.set_value("state", r.message.state);
          frm.set_value("country", r.message.country);
          frappe.msgprint(__("Location updated successfully!"));
        } else {
          frappe.msgprint(
            __("Invalid PIN Code or location not found. Check server logs.")
          );
        }
      },
      error(r) {
        frappe.dashboard.clear_comment();
        frappe.msgprint(
          __("API call failed. Check browser console and server logs.")
        );
        console.error("PIN API Error:", r);
      },
    });
  },
});
