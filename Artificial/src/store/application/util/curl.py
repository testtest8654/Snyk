import subprocess, re
from urllib.parse import urlparse

def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False

def get_url_status_code(url):
    if not is_valid_url(url):
        raise ValueError("Invalid URL")
    
    curl_args = ["curl", "-o", "/dev/null", "-w", "%{http_code}", url]
    
    try:
        result = subprocess.run(curl_args, capture_output=True, text=True, check=True)
        status_code = int(result.stdout.strip())
        return status_code
    except subprocess.CalledProcessError as e:
        return "Error getting status code"