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

  bank_name(frm) {
    format_proper_case(frm, "bank_name");
  },

  branch_name(frm) {
    format_proper_case(frm, "branch_name");
  },

  branch_address(frm) {
    format_proper_case(frm, "branch_address");
  },

  main_staff_name(frm) {
    format_proper_case(frm, "main_staff_name");
  },

  mobile_number(frm) {
    validate_mobile(frm, "mobile_number");
    check_duplicate_mobile(frm, "mobile_number");
  },

  main_staff_mobile_no(frm) {
    validate_mobile(frm, "main_staff_mobile_no");
    check_duplicate_mobile(frm, "main_staff_mobile_no");
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

  // Bank Document Upload Status
  if (frm.doc.bank_doc_attachment) {
    frm.fields_dict.bank_doc_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">
			● Bank Document Uploaded
		</div>`,
    );
  } else {
    frm.fields_dict.bank_doc_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">
			● Bank Document Not Uploaded
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

frappe.ui.form.on("Supplier", {
  refresh(frm) {
    sync_gst_rules(frm);
  },

  supplier_sub_category(frm) {
    sync_gst_rules(frm);
  },

  gstin(frm) {
    if (frm.doc.gstin) {
      frm.set_value("supplier_sub_category", "Registered");
    }
    sync_gst_rules(frm);
  },
});

function sync_gst_rules(frm) {
  const gst_fields = [
    "gstin",
    "gst_certificate",
    "status_of_gst_holder_organization_constitution_of_business",
  ];

  if (frm.doc.gstin) {
    frm.set_df_property("supplier_sub_category", "read_only", 1);
  } else {
    frm.set_df_property("supplier_sub_category", "read_only", 0);
  }

  if (frm.doc.supplier_sub_category === "Un-Registered") {
    gst_fields.forEach((field) => {
      frm.set_df_property(field, "hidden", 1);
    });

    if (frm.doc.gstin) {
      frm.set_value("gstin", "");
    }
  } else {
    gst_fields.forEach((field) => {
      frm.set_df_property(field, "hidden", 0);
    });
  }
}

frappe.ui.form.on("Supplier", {
  ifsc_code(frm) {
    const ifsc = frm.doc.ifsc_code;

    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) return;

    frappe.call({
      method: "rosewoodapp.api.supplier.fetch_ifsc_details",
      args: {
        ifsc_code: ifsc,
      },
      callback(r) {
        if (!r.message) return;

        frm.set_value("bank_name", r.message.bank_name || "");
        frm.set_value("branch_name", r.message.branch_name || "");
        frm.set_value("branch_address", r.message.branch_address || "");
        frm.set_value("micr_code", r.message.micr_code || "");
      },
    });
  },
});

const BANK_ACCOUNT_RULES = {
  "AMANA BANK": [13],
  "AXIS BANK": [12],
  "BANK OF CEYLON": [10],
  "BIMPUTH FINANCE PLC": [14, 15],
  "CARGILLS BANK": [12],
  CDB: [18],
  "CENTRAL FINANCE": [12],
  CITIBANK: [10],
  CLC: [11],
  "COMMERCIAL BANK": [10],
  "DEUTSCHE BANK": [10],
  "DFCC BANK": [12],
  "HABIB BANK": [13],
  "HATTON NATIONAL BANK": [12],
  "HDFC BANK": [12],
  "HNB FINANCE LIMITED": [12],
  HSBC: [12],
  "ICICI BANK": [12],
  "INDIAN BANK": [12],
  "INDIAN OVERSEAS BANK": [12],
  "LB FINANCE": [15],
  LOFC: [11],
  "LOLC DEVELOPMENT FINANCE PLC": [11],
  "MCB BANK": [12],
  "NATIONAL DEVELOPMENT BANK": [12],
  "NATIONS TRUST BANK": [12],
  NSB: [12],
  PABC: [12],
  "PEOPLE'S BANK": [15],
  "PUBLIC BANK": [13],
  "REGIONAL DEVELOPMENT BANK": [12],
  "SAMPATH BANK": [12],
  "SDB BANK": [10],
  "SENKADAGALA FINANCE": [12],
  "SEYLAN BANK": [15],
  "STANDARD CHARTERED BANK": [11, 12],
  "STATE BANK OF INDIA": [14],
  "UNION BANK": [16],
  "BANK OF INDIA": [15],
};

frappe.ui.form.on("Supplier", {
  bank_account_no(frm) {
    let ac_no = frm.doc.bank_account_no;

    if (!ac_no) return;

    const cleaned = ac_no.replace(/\D/g, "");

    if (ac_no !== cleaned) {
      frm.set_value("bank_account_no", cleaned);
    }
  },

  validate(frm) {
    const bank = frm.doc.bank_name;
    let ac_no = frm.doc.bank_account_no;

    if (!bank || !ac_no) return;

    ac_no = ac_no.replace(/\D/g, "");
    frm.doc.bank_account_no = ac_no;

    if (!/^\d+$/.test(ac_no)) {
      frappe.throw(__("Bank Account Number must contain digits only."));
    }

    const rules = BANK_ACCOUNT_RULES[bank.toUpperCase()];
    if (!rules) return;

    if (!rules.includes(ac_no.length)) {
      frappe.throw(
        __(
          `Invalid Bank Account Number length for ${bank}. Allowed length(s): ${rules.join(
            ", ",
          )} digits.`,
        ),
      );
    }
  },
});
