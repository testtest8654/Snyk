import os
import json
import uuid
import datetime
from jinja2 import Template

report_store = os.environ.get("REPORT_STORE", "./reports")

if not os.path.exists(report_store):
    os.mkdir(report_store)

def fetch_reports():
    reports = []

    for report_name in os.listdir(report_store):
        reports.append(Report(report_name.replace(".json", "")))

    return reports

def merge(source, destination):
    for key, value in source.items():
        if hasattr(destination, "get"):
            if destination.get(key) and type(value) == dict:
                merge(value, destination.get(key))
            else:
                destination[key] = value
        elif hasattr(destination, key) and type(value) == dict:
            merge(value, getattr(destination, key))
        else:
            setattr(destination, key, value)

def get_date():
    return datetime.datetime.now().strftime("%y/%m/%d %H:%M:%S")

class Report:

    def __init__(self, report_id = None):
        if report_id is not None and not os.path.exists(os.path.join(report_store, report_id + ".json")):
            raise Exception("Report could not be found")
        
        self.id = (report_id if report_id else str(uuid.uuid4()))
        self.title = ""
        self.description = ""
        self.updated_at = get_date()

        self.file_name = self.id + ".json"
        self.file_path = os.path.join(report_store, self.file_name)

        if os.path.exists(self.file_path):
            with open(self.file_path) as report_file:
                self.update(json.load(report_file), save=False)
        else:
            self.save()

    def __str__(self):
        return "POD-REPORT-" + self.id

    def render(self):
        template = Template("""<div>
          <h4><a href="/report/{{report.id}}">{{report.title}}</a></h4>
          <p>{{report.description}}</p>
          <p>Last updated: {{report.updated_at}}</p>
        </div>""")

        return template.render(report=self)

    def update(self, data, save=True):
        merge(data, self)

        if save:
            self.updated_at = get_date()
            self.save()

    def as_dict(self):
        return { 
            "title": self.title,
            "description": self.description,
            "updated_at": self.updated_at
        }

    def save(self):
        with open(self.file_path, "w") as report_file:
            json.dump(self.as_dict(), report_file)

    