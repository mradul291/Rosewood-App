frappe.ui.form.on("Employee", {
	// ------------------------------
	// MOBILE NUMBER VALIDATION
	// ------------------------------
	cell_number(frm) {
		validate_mobile(frm, "cell_number");
	},

	mobile_no_2(frm) {
		validate_mobile(frm, "mobile_no_2");
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
	},

	// ------------------------------
	// AUTO FULL NAME GENERATION
	// ------------------------------
	first_name: update_full_name,
	fathers_name: update_full_name,
	last_name: update_full_name,
	village_name: update_full_name,

	validate(frm) {
		// Final mobile validation before save
		validate_mobile_on_save(frm, "cell_number");
		validate_mobile_on_save(frm, "mobile_no_2");

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
