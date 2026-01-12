// frappe.ui.form.on("Address", {
//   pincode(frm) {
//     const pin = frm.doc.pincode;

//     if (!pin || pin.length !== 6) return;

//     if (!/^\d{6}$/.test(pin)) {
//       frappe.msgprint(__("PIN Code must be exactly 6 digits."));
//       return;
//     }

//     frappe.call({
//       method: "rosewoodapp.api.address.get_location_from_pincode",
//       args: { pincode: pin },
//       callback: function (r) {
//         if (r.message && r.message.city) {
//           frm.set_value("city", r.message.city);
//           frm.set_value("state", r.message.state);
//           frm.set_value("country", r.message.country);
//         } else {
//           frappe.msgprint(__("Invalid PIN Code or location not found."));
//         }
//       },
//     });
//   },
// });
