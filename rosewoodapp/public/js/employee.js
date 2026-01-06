frappe.ui.form.on("Employee", {
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

	validate(frm) {
		// Final mobile validation before save
		validate_mobile_on_save(frm, "cell_number");
		validate_mobile_on_save(frm, "mobile_no_2");
		validate_mobile_on_save(frm, "spouse_contact_number");

		if (frm.doc.aadhar_card_no && frm.doc.aadhar_card_no.length !== 12) {
			frappe.throw(__("Aadhar Card No. must be exactly 12 digits."));
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
			__(`${frappe.meta.get_label("Employee", fieldname)} must be exactly 10 digits.`)
		);
	}
}

function update_full_name(frm) {
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
					Do you want to allow duplicate entry?`
				),
				() => {
					// User approved → do nothing
				},
				() => {
					// User rejected → clear field
					frm.set_value(fieldname, "");
				}
			);
		},
	});
}

function validate_pan(frm) {
	let pan = frm.doc.pan_number;
	if (!pan) return;

	// Force uppercase
	pan = pan.toUpperCase();
	frm.set_value("pan_number", pan);

	// PAN format: 5 alphabets + 4 digits + 1 alphabet
	const pan_regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

	if (!pan_regex.test(pan)) {
		frappe.msgprint(
			__(
				"Invalid PAN format.<br><br>" +
					"PAN must be in the format:<br>" +
					"<b>ABCDE1234F</b>"
			)
		);
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
					`${frappe.meta.get_label("Employee", fieldname)} already exists for:<br><br>
					<b>${emp.employee_name}</b> (${emp.name})`
				)
			);

			frm.set_value(fieldname, "");
		},
	});
}
