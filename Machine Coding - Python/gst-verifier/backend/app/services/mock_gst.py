# Mock GST Data
MOCK_GST_DATA = {
    "27AAPFU0939F1ZV": {
        "gstin": "27AAPFU0939F1ZV",
        "business_name": "ABC ENTERPRISES",
        "status": "Active",
        "state": "Maharashtra",
        "registration_date": "2017-07-01",
        "taxpayer_type": "Regular",
        "address": "123, Business Park, Mumbai - 400001"
    },
    "29AAACB2230M1Z5": {
        "gstin": "29AAACB2230M1Z5",
        "business_name": "Bright Tech Solutions",
        "status": "Active",
        "state": "Karnataka",
        "registration_date": "2018-03-15",
        "taxpayer_type": "Regular",
        "address": "45, IT Hub, Bengaluru - 560001"
    },
    "07AACCM9910C1Z2": {
        "gstin": "07AACCM9910C1Z2",
        "business_name": "Metro Traders",
        "status": "Active",
        "state": "Delhi",
        "registration_date": "2019-06-20",
        "taxpayer_type": "Regular",
        "address": "12, Connaught Place, New Delhi - 110001"
    },
    "33AAACR1122B1Z7": {
        "gstin": "33AAACR1122B1Z7",
        "business_name": "Royal Textiles",
        "status": "Active",
        "state": "Tamil Nadu",
        "registration_date": "2020-01-10",
        "taxpayer_type": "Regular",
        "address": "78, Textile Market, Coimbatore - 641001"
    },
    "24AAACG3344C1Z9": {
        "gstin": "24AAACG3344C1Z9",
        "business_name": "Green Agro Products",
        "status": "Active",
        "state": "Gujarat",
        "registration_date": "2021-09-05",
        "taxpayer_type": "Regular",
        "address": "56, Industrial Estate, Ahmedabad - 380001"
    }
}

# Function to verify GSTIN
def verify_gstin(gstin: str) -> dict | None:
    gstin = gstin.upper()

    if gstin in MOCK_GST_DATA:
        return MOCK_GST_DATA[gstin]
    return None