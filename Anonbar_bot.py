

# আপনার টেলিগ্রাম বটের API টোকেন
API_TOKEN = "6956798841:AAE2DzgpSfgO3bYydjcAt0dzx106Ij-RcUw"
CHAT_ID = "আপনার চ্যাট আইডি এখানে"  # আপনার চ্যাট ID দিন

# টেলিগ্রাম বটের API URL
BASE_URL = f"https://api.telegram.org/bot{API_TOKEN}"

# মেনু বাটন তৈরি করার জন্য কীবোর্ড
keyboard = [
    [
        {"text": "Start", "callback_data": "start"},
        {"text": "Contact Admin", "callback_data": "contact_admin"},
        {"text": "Join Our Telegram Channel", "callback_data": "join_channel"}
    ]
]

# Start Command মেসেজ
def send_start_message():
    url = f"{BASE_URL}/sendMessage"
    params = {
        "chat_id": CHAT_ID,
        "text": "Welcome! Please choose an option below:",
        "reply_markup": {"keyboard": keyboard, "one_time_keyboard": True, "resize_keyboard": True}
    }
    response = requests.post(url, json=params)
    return response.json()

# Contact Admin
def send_contact_admin():
    url = f"{BASE_URL}/sendMessage"
    params = {
        "chat_id": CHAT_ID,
        "text": "You can contact the admin at: @mehedi_exx"
    }
    response = requests.post(url, json=params)
    return response.json()

# Join Telegram Channel
def send_join_channel():
    url = f"{BASE_URL}/sendMessage"
    params = {
        "chat_id": CHAT_ID,
        "text": "Join our Telegram channel here: https://t.me/Anonbar"
    }
    response = requests.post(url, json=params)
    return response.json()

# Callback Query Handler
def handle_callback(query_data):
    if query_data == "start":
        send_start_message()
    elif query_data == "contact_admin":
        send_contact_admin()
    elif query_data == "join_channel":
        send_join_channel()

# মেনু টেক্সট পাঠানোর জন্য প্রধান ফাংশন
def main():
    send_start_message()

    # আপনার কাস্টম ক্যালব্যাক ডাটা হ্যান্ডেল করতে হবে
    # উদাহরণস্বরূপ, যদি কেউ "Start" বাটন ক্লিক করে, তাহলে handle_callback("start") কল করতে হবে
    # বাকী বাটনগুলির জন্য একইভাবে কাজ করবে
    # এর জন্য টেলিগ্রাম Bot API থেকে ক্যালব্যাক ডাটা নিয়ে হ্যান্ডল করতে হবে

if __name__ == "__main__":
    main()
