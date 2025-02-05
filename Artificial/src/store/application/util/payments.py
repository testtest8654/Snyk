import uuid
from urllib.parse import urlparse, parse_qs

def generate_payment_link(amt):
    # Dummy implementation to generate a payment link
    payment_id = str(uuid.uuid4())
    payment_link = f"https://dummy-payment-processor.htb/pay?amount={amt}&payment_id={payment_id}"
    return payment_link, payment_id

def get_amount_paid(payment_id):
    # Dummy implementation to get payment status
    return 0