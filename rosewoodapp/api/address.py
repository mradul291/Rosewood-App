import frappe
import requests

@frappe.whitelist()
def get_location_from_pincode(pincode):
    if not pincode or len(pincode) != 6 or not pincode.isdigit():
        return None

    url = f"https://api.postalpincode.in/pincode/{pincode}"

    try:
        res = requests.get(
            url, 
            timeout=30,  # Increased from 10
            headers={'User-Agent': 'Mozilla/5.0 (compatible; Frappe/15)'}
        )

        # Log response for debugging
        frappe.msgprint(f"API Response Status: {res.status_code}, Content preview: {res.text[:200]}", 
                       raise_exception=False,  # Won't break but shows info
                       title="PIN Debug (check console)")

        data = res.json()

        if not isinstance(data, list) or not data:
            frappe.log_error(f"No data list for PIN {pincode}: {res.text}", "PIN Code API Empty")
            return None

        first = data[0]

        if first.get("Status") != "Success":
            frappe.log_error(f"API Status not Success for PIN {pincode}: {first.get('Status')}", "PIN Code API Failed")
            return None

        post_offices = first.get("PostOffice")
        if not post_offices:
            frappe.log_error(f"No PostOffice for PIN {pincode}", "PIN Code API No Offices")
            return None

        # Pick first PostOffice
        po = post_offices[0]

        result = {
            "city": po.get("District") or po.get("Name"),
            "state": po.get("State"),
            "country": po.get("Country") or "India"
        }
        
        # Log success
        frappe.log_error(f"SUCCESS PIN {pincode}: {result}", "PIN Code API Success", alert=True)
        return result

    except requests.exceptions.Timeout:
        frappe.log_error(f"Timeout for PIN {pincode} after 30s", "PIN Code API Timeout")
        return None
    except requests.exceptions.ConnectionError as e:
        frappe.log_error(f"Connection error for PIN {pincode}: {str(e)}", "PIN Code API Connection")
        return None
    except Exception as e:
        frappe.log_error(
            f"PIN {pincode} API full error: {str(e)}\nResponse: {locals().get('res', 'No res')}\nTraceback: {frappe.get_traceback()}",
            "PIN Code API Failed"
        )
        return None
