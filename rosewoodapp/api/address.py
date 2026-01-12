import frappe
import requests

@frappe.whitelist()
def get_location_from_pincode(pincode):
    if not pincode or len(pincode) != 6 or not pincode.isdigit():
        return {}

    url = f"https://api.postalpincode.in/pincode/{pincode}"

    try:
        response = requests.get(url, timeout=5)
        data = response.json()

        if (
            data
            and data[0].get("Status") == "Success"
            and data[0].get("PostOffice")
        ):
            po = data[0]["PostOffice"][0]  # take first PostOffice

            return {
                "city": po.get("District") or po.get("Name"),
                "state": po.get("State"),
                "country": po.get("Country") or "India"
            }

    except Exception:
        frappe.log_error(frappe.get_traceback(), "Pincode API Error")

    return {}
