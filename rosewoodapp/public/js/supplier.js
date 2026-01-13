frappe.ui.form.on("Supplier", {
  refresh(frm) {
    apply_supplier_document_rules(frm);
    update_upload_status(frm);
    toggle_partnership_owner_fields(frm);
  },

  supplier_constitution(frm) {
    apply_supplier_document_rules(frm);
    update_upload_status(frm);
  },

  gst_certificate(frm) {
    update_upload_status(frm);
  },

  pan_document(frm) {
    update_upload_status(frm);
  },

  aadhar_number(frm) {
    const val = frm.doc.aadhar_number;
    if (!val) return;

    // Allow only digits while typing
    if (!/^\d+$/.test(val)) {
      frappe.msgprint(__("Aadhaar Card Number must contain digits only."));
      frm.set_value("aadhar_number", "");
      return;
    }

    // Allow typing till 12 digits, block only if exceeded
    if (val.length > 12) {
      frappe.msgprint(__("Aadhaar Card Number must be exactly 12 digits."));
      frm.set_value("aadhar_number", val.slice(0, 12));
    }
  },

  supplier_constitution(frm) {
    toggle_partnership_owner_fields(frm);
  },

  supplier_name(frm) {
    format_proper_case(frm, "supplier_name");
  },

  alias(frm) {
    format_proper_case(frm, "alias");
  },

  validate(frm) {
    if (frm.doc.aadhar_number && frm.doc.aadhar_number.length !== 12) {
      frappe.throw(__("Aadhaar Card Number must be exactly 12 digits."));
    }
  },
});

function apply_supplier_document_rules(frm) {
  if (!frm.doc.supplier_constitution) return;

  const is_individual = frm.doc.supplier_constitution === "Individual";

  // Mandatory only if NOT Individual
  frm.toggle_display("gst_certificate", !is_individual);
  frm.toggle_display("gst_certificate_upload_status", !is_individual);
  frm.toggle_display("pan_document", !is_individual);
  frm.toggle_display("pan_document_upload_status", !is_individual);
}

function update_upload_status(frm) {
  // GST Status
  if (frm.doc.gst_certificate) {
    frm.fields_dict.gst_certificate_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">
                ● GST Certificate Uploaded
            </div>`
    );
  } else {
    frm.fields_dict.gst_certificate_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">
                ● GST Certificate Not Uploaded
            </div>`
    );
  }

  // PAN Status
  if (frm.doc.pan_document) {
    frm.fields_dict.pan_document_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">
                ● PAN Document Uploaded
            </div>`
    );
  } else {
    frm.fields_dict.pan_document_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">
                ● PAN Document Not Uploaded
            </div>`
    );
  }

  // Aadhar Status
  if (frm.doc.aadhar_attachment) {
    frm.fields_dict.aadhar_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">
                ● Aadhaar Document Uploaded
            </div>`
    );
  } else {
    frm.fields_dict.aadhar_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">
                ● Aadhaar Document Not Uploaded
            </div>`
    );
  }
}

function toggle_partnership_owner_fields(frm) {
  const is_partnership = frm.doc.supplier_constitution === "Partnership Firm";

  frm.toggle_display("owner_name", is_partnership);
  frm.toggle_display("owner_mobile_no", is_partnership);
}

function proper(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function format_proper_case(frm, fieldname) {
  const value = frm.doc[fieldname];
  if (!value) return;

  const formatted = proper(value);

  // Prevent unnecessary set_value loops
  if (value !== formatted) {
    frm.set_value(fieldname, formatted);
  }
}

// frappe.ui.form.on("Supplier", {
//   setup(frm) {
//     frm.set_query("supplier_current_address", function () {
//       if (!frm.doc.name) return {};

//       return {
//         filters: {
//           link_doctype: "Supplier",
//           link_name: frm.doc.name,
//         },
//       };
//     });
//   },
// });

// frappe.ui.form.on("Supplier", {
//   refresh(frm) {
//     render_current_address(frm);
//   },

//   supplier_current_address(frm) {
//     render_current_address(frm);
//   },
// });

// function render_current_address(frm) {
//   const address = frm.doc.supplier_current_address;

//   if (!address) {
//     frm.set_value("current_address", "");
//     return;
//   }

//   // ERPNext v15 standard method
//   frappe.utils.get_address_display(address).then((html) => {
//     frm.set_value("current_address", html || "");
//   });
// }
