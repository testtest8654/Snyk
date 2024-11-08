import io
import os
from urllib.parse import quote

from dotenv import load_dotenv
from flask import Flask, abort, jsonify, render_template, request, send_file
from werkzeug.exceptions import HTTPException
import requests

load_dotenv()

from auth import auth_required
from report import Report, fetch_reports

app = Flask(__name__)

system_version = "v1.0"
pdf_generation_URL = "http://127.0.0.1:3002"

is_generating_report = False

@app.route("/")
def stats_handler():
    return render_template("index.html", reports=fetch_reports(), system_version=system_version)

@app.route("/generate-report")
def generate_report_handler():
    global is_generating_report

    if is_generating_report:
        abort(422)
    
    is_generating_report = True

    try:
        pdf_response = requests.get(f"{pdf_generation_URL}/generate?url={quote('http://localhost/')}")

        if pdf_response is None or pdf_response.status_code != 200:
            is_generating_report = False
            abort(pdf_response.status_code)

        is_generating_report = False
        return send_file(
            io.BytesIO(pdf_response.content), 
            mimetype="application/json", 
            as_attachment=True,
            download_name="report.pdf"
        )
    except:
        is_generating_report = False
        abort(pdf_response.status_code)

@app.route("/report", defaults={"report_id": None}, methods=["GET"])
@app.route("/report/<report_id>", methods=["GET"])
@auth_required
def report_handler(report_id):
    title = ""
    description = ""

    try:
        report = Report(report_id)

        title = report.title
        description = report.description
    except:
        abort(404)

    return render_template("report.html", report=report, title=title, description=description)

@app.route("/report", defaults={"report_id": None}, methods=["POST"])
@app.route("/report/<report_id>", methods=["POST"])
@auth_required
def submit_report_handler(report_id):
    request_data = request.json

    if "title" not in request_data or "description" not in request_data:
        return jsonify({ "success": False, "error": "Missing parameters!"})

    report = Report(report_id)
    report.update(request_data)

    return jsonify({"success": True, "report_id": str(report)})

@app.errorhandler(HTTPException)
def http_error_handler(error):
    return render_template("error.html", status_code=error.code)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3000)
