frappe.ui.form.on("Employee", {
  refresh(frm) {
    update_document_upload_status(frm);
  },

  aadhar_attachment(frm) {
    update_document_upload_status(frm);
  },

  pan_attachment(frm) {
    update_document_upload_status(frm);
  },

  cv_attachment(frm) {
    update_document_upload_status(frm);
  },

  bank_doc_attachment(frm) {
    update_document_upload_status(frm);
  },

  // ------------------------------
  // MOBILE NUMBER VALIDATION
  // ------------------------------
  cell_number(frm) {
    validate_mobile(frm, "cell_number");
    check_duplicate_mobile(frm, "cell_number");
  },

  mobile_no_2(frm) {
    validate_mobile(frm, "mobile_no_2");
    check_duplicate_mobile(frm, "mobile_no_2");
  },

  spouse_contact_number(frm) {
    validate_mobile(frm, "spouse_contact_number");
  },

  fathers_mobile_no(frm) {
    validate_mobile(frm, "fathers_mobile_no");
    check_duplicate_mobile(frm, "fathers_mobile_no");
  },

  // ------------------------------
  // AADHAR VALIDATION (EXISTING)
  // ------------------------------
  aadhar_card_no(frm) {
    const val = frm.doc.aadhar_card_no;
    if (!val) return;

    if (!/^\d+$/.test(val)) {
      frappe.msgprint(__("Aadhar Card No. must contain digits only."));
      frm.set_value("aadhar_card_no", "");
      return;
    }

    if (val.length > 12) {
      frappe.msgprint(__("Aadhar Card No. must be exactly 12 digits."));
      frm.set_value("aadhar_card_no", "");
    }

    check_unique_employee_field(frm, "aadhar_card_no");
  },

  // ------------------------------
  // PAN Validations
  // ------------------------------
  pan_number(frm) {
    validate_pan(frm);
    check_unique_employee_field(frm, "pan_number");
  },

  // ------------------------------
  // DOB Validation
  // ------------------------------

  date_of_birth(frm) {
    validate_employee_age(frm);
  },

  // ------------------------------
  // AUTO FULL NAME GENERATION
  // ------------------------------
  first_name: update_full_name,
  fathers_name: update_full_name,
  last_name: update_full_name,
  village_name: update_full_name,

  // ------------------------------
  // REAL-TIME PROPER CASE FORMATTING
  // ------------------------------
  first_name(frm) {
    format_proper_case(frm, "first_name");
    update_full_name(frm);
  },

  middle_name(frm) {
    format_proper_case(frm, "middle_name");
  },

  last_name(frm) {
    format_proper_case(frm, "last_name");
    update_full_name(frm);
  },

  fathers_name(frm) {
    format_proper_case(frm, "fathers_name");
    update_full_name(frm);
  },

  village_name(frm) {
    format_proper_case(frm, "village_name");
    update_full_name(frm);
  },

  person_to_be_contacted(frm) {
    format_proper_case(frm, "person_to_be_contacted");
  },

  reference_name_for_joining(frm) {
    format_proper_case(frm, "reference_name_for_joining");
  },

  current_address(frm) {
    format_proper_case(frm, "current_address");
  },

  permanent_address(frm) {
    format_proper_case(frm, "permanent_address");
  },

  spouse_first_name(frm) {
    format_proper_case(frm, "spouse_first_name");
  },

  spouse_middle_name(frm) {
    format_proper_case(frm, "spouse_middle_name");
  },

  spouse_last_name(frm) {
    format_proper_case(frm, "spouse_last_name");
  },

  full_name_with_village_name(frm) {
    format_proper_case(frm, "full_name_with_village_name");
  },

  alias(frm) {
    format_proper_case(frm, "alias");
  },

  bank_name(frm) {
    format_proper_case(frm, "bank_name");
  },

  branch_name(frm) {
    if (!frm.doc.allow_custom_branch_name_case) {
      format_proper_case(frm, "branch_name");
    }
  },

  branch_address(frm) {
    if (!frm.doc.allow_custom_branch_name_case) {
      format_proper_case(frm, "branch_address");
    }
  },

  allow_custom_branch_name_case(frm) {
    // When user UNCHECKS, immediately normalize existing values
    if (!frm.doc.allow_custom_branch_name_case) {
      format_proper_case(frm, "branch_name");
      format_proper_case(frm, "branch_address");
    }
  },

  validate(frm) {
    // Final mobile validation before save
    validate_mobile_on_save(frm, "cell_number");
    validate_mobile_on_save(frm, "mobile_no_2");
    validate_mobile_on_save(frm, "spouse_contact_number");
    validate_mobile_on_save(frm, "fathers_mobile_no");
    update_full_name(frm);

    // Final PAN check on save
    if (frm.doc.pan_number && frm.doc.pan_number.length !== 10) {
      frappe.throw(__("PAN Number must be exactly 10 characters."));
    }

    if (frm.doc.aadhar_card_no && frm.doc.aadhar_card_no.length !== 12) {
      frappe.throw(__("Aadhar Card No. must be exactly 12 digits."));
    }
    if (frm.doc.date_of_birth) {
      const dob = frappe.datetime.str_to_obj(frm.doc.date_of_birth);
      const today = frappe.datetime.str_to_obj(frappe.datetime.get_today());

      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        frappe.throw(__("Employee must be at least 18 years old."));
      }
    }
  },
});

// ==============================
// HELPER FUNCTIONS
// ==============================

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

function validate_mobile_on_save(frm, fieldname) {
  const val = frm.doc[fieldname];
  if (val && val.length !== 10) {
    frappe.throw(
      __(
        `${frappe.meta.get_label(
          "Employee",
          fieldname,
        )} must be exactly 10 digits.`,
      ),
    );
  }
}

function update_full_name(frm) {
  if (frm.doc.allow_manual_full_name_with_village) {
    return;
  }
  const first = proper(frm.doc.first_name);
  const father = proper(first_word(frm.doc.fathers_name));
  const last = proper(frm.doc.last_name);
  const village = proper(frm.doc.village_name);

  const parts = [first, father, last, village].filter(Boolean);

  frm.set_value("full_name_with_village_name", parts.join(" "));
}

function first_word(value) {
  if (!value) return "";
  return value.trim().split(" ")[0];
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
    method: "rosewoodapp.api.employee.check_duplicate_mobile",
    args: {
      mobile: mobile,
      current_employee: frm.doc.name,
    },
    callback: function (r) {
      if (!r.message || !r.message.duplicate) return;

      const emp = r.message.employee;

      frappe.confirm(
        __(
          `This Mobile Number is already used by Employee:<br><br>
					<b>${emp.employee_name}</b> (${emp.name})<br><br>
					Do you want to allow duplicate entry?`,
        ),
        () => {
          // User approved → do nothing
        },
        () => {
          // User rejected → clear field
          frm.set_value(fieldname, "");
        },
      );
    },
  });
}

function validate_pan(frm) {
  let pan = frm.doc.pan_number;
  if (!pan) return;

  // Always normalize
  pan = pan.toUpperCase().trim();
  frm.set_value("pan_number", pan);

  if (pan.length < 10) {
    return;
  }

  if (pan.length > 10) {
    frappe.msgprint({
      title: __("Invalid PAN Number"),
      message: __("PAN must be exactly 10 characters."),
      indicator: "red",
    });
    frm.set_value("pan_number", "");
    return;
  }

  // PAN format: 5 letters + 4 digits + 1 letter
  const pan_regex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (!pan_regex.test(pan)) {
    frappe.msgprint({
      title: __("Invalid PAN Number"),
      message: __("PAN must be in the format:<br><br><b>ABCDE1234F</b>"),
      indicator: "red",
    });
    frm.set_value("pan_number", "");
  }
}

function check_unique_employee_field(frm, fieldname) {
  const value = frm.doc[fieldname];
  if (!value) return;

  frappe.call({
    method: "rosewoodapp.api.employee.check_unique_employee_field",
    args: {
      fieldname: fieldname,
      value: value,
      current_employee: frm.doc.name,
    },
    callback: function (r) {
      if (!r.message || !r.message.duplicate) return;

      const emp = r.message.employee;

      frappe.msgprint(
        __(
          `${frappe.meta.get_label(
            "Employee",
            fieldname,
          )} already exists for:<br><br>
					<b>${emp.employee_name}</b> (${emp.name})`,
        ),
      );

      frm.set_value(fieldname, "");
    },
  });
}

function validate_employee_age(frm) {
  if (!frm.doc.date_of_birth) return;

  const dob = frappe.datetime.str_to_obj(frm.doc.date_of_birth);
  const today = frappe.datetime.get_today();
  const today_date = frappe.datetime.str_to_obj(today);

  // Calculate age
  let age = today_date.getFullYear() - dob.getFullYear();
  const m = today_date.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today_date.getDate() < dob.getDate())) {
    age--;
  }

  if (age < 18) {
    frappe.msgprint({
      title: __("Invalid Date of Birth"),
      message: __("Employee must be at least 18 years old."),
      indicator: "red",
    });
    frm.set_value("date_of_birth", "");
  }
}

function update_document_upload_status(frm) {
  // Aadhaar
  if (frm.doc.aadhar_attachment) {
    frm.fields_dict.aadhar_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">● Uploaded</div>`,
    );
  } else {
    frm.fields_dict.aadhar_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">● Not Uploaded</div>`,
    );
  }

  // PAN
  if (frm.doc.pan_attachment) {
    frm.fields_dict.pan_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">● Uploaded</div>`,
    );
  } else {
    frm.fields_dict.pan_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">● Not Uploaded</div>`,
    );
  }

  // CV
  if (frm.doc.cv_attachment) {
    frm.fields_dict.cv_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">● Uploaded</div>`,
    );
  } else {
    frm.fields_dict.cv_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">● Not Uploaded</div>`,
    );
  }

  // Bank Document (Passbook / Cheque)
  if (frm.doc.bank_doc_attachment) {
    frm.fields_dict.bank_doc_upload_status.$wrapper.html(
      `<div style="color: green; font-weight: 500; font-size: 12px;">● Uploaded</div>`,
    );
  } else {
    frm.fields_dict.bank_doc_upload_status.$wrapper.html(
      `<div style="color: red; font-weight: 500; font-size: 12px;">● Not Uploaded</div>`,
    );
  }
}

frappe.ui.form.on("Employee", {
  ifsc_code(frm) {
    const ifsc = frm.doc.ifsc_code;

    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) return;

    frappe.call({
      method: "rosewoodapp.api.employee.fetch_ifsc_details",
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

frappe.ui.form.on("Employee", {
  refresh(frm) {
    setup_reference_autocomplete(frm);
  },
});

function setup_reference_autocomplete(frm) {
  const field = frm.get_field("reference_name_for_joining");
  if (!field || !field.$input) return;

  // Prevent multiple bindings
  if (field.$input.data("autocomplete_attached")) return;
  field.$input.data("autocomplete_attached", true);

  // Attach Awesomplete
  field.$input[0].awesomplete = new Awesomplete(field.$input[0], {
    minChars: 1,
    maxItems: 10,
    autoFirst: true,
    list: [],
  });

  // Input listener
  field.$input.on("input", function () {
    const txt = field.$input.val();
    if (!txt || txt.length < 1) return;

    frappe.call({
      method: "frappe.desk.search.search_link",
      args: {
        doctype: "Employee",
        txt: txt,
        page_length: 5,
      },
      callback: function (r1) {
        frappe.call({
          method: "frappe.desk.search.search_link",
          args: {
            doctype: "Supplier",
            txt: txt,
            page_length: 5,
          },
          callback: function (r2) {
            const results = [];

            // Employee results
            if (r1 && r1.message) {
              r1.message.forEach((d) => {
                results.push(d.description);
              });
            }

            // Supplier results
            if (r2 && r2.message) {
              r2.message.forEach((d) => {
                results.push(d.description);
              });
            }

            field.$input[0].awesomplete.list = results;
          },
        });
      },
    });
  });
}
