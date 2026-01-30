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

  mobile_number(frm) {
    validate_mobile(frm, "mobile_number");
    check_duplicate_mobile(frm, "mobile_number");
  },

  validate(frm) {
    // Aadhar Validation
    if (frm.doc.aadhar_number && frm.doc.aadhar_number.length !== 12) {
      frappe.throw(__("Aadhaar Card Number must be exactly 12 digits."));
    }

    // Mobile Number validation (NEW)
    if (frm.doc.mobile_number) {
      if (!/^\d+$/.test(frm.doc.mobile_number)) {
        frappe.throw(__("Mobile number must contain digits only."));
      }

      if (frm.doc.mobile_number.length !== 10) {
        frappe.throw(__("Mobile number must be exactly 10 digits."));
      }
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
            </div>`,
    );
  } else {
    frm.fields_dict.gst_certificate_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">
                ● GST Certificate Not Uploaded
            </div>`,
    );
  }

  // PAN Status
  if (frm.doc.pan_document) {
    frm.fields_dict.pan_document_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">
                ● PAN Document Uploaded
            </div>`,
    );
  } else {
    frm.fields_dict.pan_document_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">
                ● PAN Document Not Uploaded
            </div>`,
    );
  }

  // Aadhar Status
  if (frm.doc.aadhar_attachment) {
    frm.fields_dict.aadhar_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">
                ● Aadhaar Document Uploaded
            </div>`,
    );
  } else {
    frm.fields_dict.aadhar_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">
                ● Aadhaar Document Not Uploaded
            </div>`,
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

function check_duplicate_mobile(frm, fieldname) {
  const mobile = frm.doc[fieldname];
  if (!mobile || mobile.length !== 10) return;

  frappe.call({
    method: "rosewoodapp.api.supplier.check_duplicate_mobile",
    args: {
      mobile: mobile,
      current_supplier: frm.doc.name,
    },
    callback: function (r) {
      if (!r.message || !r.message.duplicate) return;

      const sup = r.message.supplier;

      frappe.confirm(
        __(
          `This Mobile Number is already used by Supplier:<br><br>
          <b>${sup.supplier_name}</b> (${sup.name})<br><br>
          Do you want to allow duplicate entry?`,
        ),
        () => {
          // User allowed duplicate → do nothing
        },
        () => {
          // User rejected → clear field
          frm.set_value(fieldname, "");
        },
      );
    },
  });
}

function validate_mobile(frm, fieldname) {
  const val = frm.doc[fieldname];
  if (!val) return;

  if (!/^\d+$/.test(val)) {
    frappe.msgprint(__("Mobile number must contain digits only."));
    frm.set_value(fieldname, "");
    return;
  }

  if (val.length > 10) {
    frappe.msgprint(__("Mobile number must be exactly 10 digits."));
    frm.set_value(fieldname, "");
  }
}

frappe.ui.form.on("Supplier", {
  setup(frm) {
    frm.set_query("supplier_current_address", function (doc) {
      return {
        query: "erpnext.buying.doctype.supplier.supplier.get_supplier_primary",
        filters: {
          supplier: doc.name,
          type: "Address",
        },
      };
    });
  },
});

frappe.ui.form.on("Supplier", {
  supplier_current_address(frm) {
    if (frm.doc.supplier_current_address) {
      frappe.call({
        method: "frappe.contacts.doctype.address.address.get_address_display",
        args: {
          address_dict: frm.doc.supplier_current_address,
        },
        callback: function (r) {
          frm.set_value("current_address_text", r.message);
        },
      });
    }

    if (!frm.doc.supplier_current_address) {
      frm.set_value("current_address_text", "");
    }
  },
});

// Pan and GST Status Logics

frappe.ui.form.on("Supplier", {
  pan(frm) {
    derive_pan_and_gst_status(frm);
  },

  gstin(frm) {
    // PAN may get auto-derived from GSTIN here
    derive_pan_and_gst_status(frm);
  },

  before_save(frm) {
    derive_pan_and_gst_status(frm);
  },

  validate(frm) {
    derive_pan_and_gst_status(frm);
  },
});

function derive_pan_and_gst_status(frm) {
  if (!frm.doc.pan || frm.doc.pan.length < 4) {
    clear_derived_fields(frm);
    return;
  }

  const pan = frm.doc.pan.toUpperCase();
  const pan_type_char = pan.charAt(3);

  // ----- PAN HOLDER STATUS -----
  const pan_holder_map = {
    P: "Individual Person",
    C: "Company",
    F: "Firm/Limited Liability Partnership (LLP)",
    H: "Hindu Undivided Family (HUF)",
    T: "Trust",
    A: "Association of Persons (AOP)",
    B: "Body of Individuals (BOI)",
    G: "Government Agency",
    L: "Local Authority",
    J: "Artificial Juridicial Person",
  };

  // ----- GST HOLDER STATUS -----
  const gst_holder_map = {
    P: "Proprietorship Firm",
    C: "Company",
    F: "Firm/Limited Liability Partnership (LLP)",
    H: "Hindu Undivided Family (HUF)",
    T: "Trust",
    A: "Association of Persons (AOP)",
    B: "Body of Individuals (BOI)",
    G: "Government Agency",
    L: "Local Authority",
    J: "Artificial Juridicial Person",
  };

  if (pan_holder_map[pan_type_char]) {
    frm.set_value("status_of_pan_holder", pan_holder_map[pan_type_char]);
  } else {
    frm.set_value("status_of_pan_holder", "");
  }

  if (gst_holder_map[pan_type_char]) {
    frm.set_value(
      "status_of_gst_holder_organization_constitution_of_business",
      gst_holder_map[pan_type_char],
    );
  } else {
    frm.set_value(
      "status_of_gst_holder_organization_constitution_of_business",
      "",
    );
  }
}

function clear_derived_fields(frm) {
  frm.set_value("status_of_pan_holder", "");
  frm.set_value(
    "status_of_gst_holder_organization_constitution_of_business",
    "",
  );
}

frappe.ui.form.on("Supplier", {
  refresh(frm) {
    frm.add_custom_button(__("Verify PAN Aadhaar Link"), function () {
      window.open(
        "https://eportal.incometax.gov.in/iec/foservices/#/pre-login/link-aadhaar-status",
        "_blank",
      );
    });
  },
});
