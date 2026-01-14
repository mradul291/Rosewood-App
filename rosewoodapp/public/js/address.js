frappe.ui.form.on("Address", {
  pincode(frm) {
    const pin = frm.doc.pincode;

    if (!pin || !/^\d{6}$/.test(pin)) return;

    console.log("Fetching PIN from browser:", pin);

    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Browser API Response:", data);

        if (
          data &&
          data[0] &&
          data[0].Status === "Success" &&
          data[0].PostOffice &&
          data[0].PostOffice.length
        ) {
          const po = data[0].PostOffice[0];

          frm.set_value("city", po.District);
          frm.set_value("state", po.State);
          frm.set_value("country", po.Country || "India");
        } else {
          frappe.msgprint(__("Invalid PIN Code"));
        }
      })
      .catch((err) => {
        console.error("Browser PIN API failed:", err);
        frappe.msgprint(__("Unable to reach PIN Code service"));
      });
  },
});
