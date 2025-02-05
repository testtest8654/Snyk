import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service

def bot_runner(email, password, payment_id):
    firefox_options = Options()

    firefox_binary_path = "/opt/firefox/firefox"
    geckodriver_path = "/usr/local/bin/geckodriver"

    firefox_options.add_argument("--headless")
    firefox_options.binary_location = firefox_binary_path

    firefox_service = Service(geckodriver_path)
    client = webdriver.Firefox(service=firefox_service, options=firefox_options)

    try:
        client.get("http://127.0.0.1:1337/login")
        time.sleep(3)

        client.find_element(By.ID, "email").send_keys(email)
        client.find_element(By.ID, "password").send_keys(password)
        client.execute_script("document.getElementById('login-btn').click()")
        time.sleep(3)

        client.get(f"http://127.0.0.1:1337/static/invoices/invoice_{payment_id}.pdf")
        time.sleep(10)
    finally:
        client.quit()
