from functools import wraps
from flask import g, request, redirect, url_for, make_response, abort, render_template
import base64
import os

engineer_username = os.environ.get("ENGINEER_USERNAME")
engineer_password = os.environ.get("ENGINEER_PASSWORD")

if engineer_username is None or engineer_password is None:
    print("Missing engineer username and password, shutting down...")
    exit()

class AuthenticationException(Exception):
    pass

def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            header_value = request.headers.get("Authorization")

            if header_value is None:
                raise AuthenticationException("No Authorization header")

            if not header_value.startswith("Basic "):
                raise AuthenticationException("Only Basic auth supported")
            
            _, encoded_auth = header_value.split(" ")

            decoded_auth = base64.b64decode(encoded_auth).decode()

            username, password = decoded_auth.split(":")

            if username != engineer_username or password != engineer_password:
                raise AuthenticationException("Invalid username and password")

            return f(*args, **kwargs)
        except AuthenticationException as e:
            response = make_response(render_template("error.html", status_code=401, error_message="Engineers Only!"), 401)
            response.headers["WWW-Authenticate"] = 'Basic realm="Engineer Portal"'
            return response

    return decorated_function