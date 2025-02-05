from application.app import app
from application.util.database import Database

db_session = Database()
db_session.migrate(app.config["ADMIN_EMAIL"], app.config["ADMIN_PASS"])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=1337, threaded=True, debug=False)
