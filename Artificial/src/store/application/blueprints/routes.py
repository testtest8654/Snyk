import urllib, requests, ast
from io import BytesIO
from flask import request, session, render_template, redirect, Blueprint, current_app, session, send_file

from application.util.database import Database
from application.util.payments import generate_payment_link, get_amount_paid
from application.util.bot import bot_runner
from application.util.curl import get_url_status_code
from application.util.grpc_utils.grpc_helper import ProductClient

web = Blueprint("web", __name__)

@web.route("/", methods=["GET"])
def index():
	if session and session["loggedin"]:
		return render_template("home.html", title="Home", session=session)

	return render_template("home.html", title="Home")

@web.route("/login", methods=["GET", "POST"])
def login():
	if request.method == "GET":
		return render_template("login.html", title="Log-in")

	email = request.form.get("email")
	password = request.form.get("password")

	if not email or not password:
		return render_template("error.html", title="Error", error="Missing parameters"), 400

	db_session = Database()
	user_valid, user_data = db_session.check_user(email, password)

	if not user_valid:
		return render_template("error.html", title="Error", error="Invalid email/password"), 401

	session["loggedin"] = True
	session["user_id"] = user_data.id
	session["email"] = email
	session["role"] = user_data.role

	return redirect("/")

@web.route("/register", methods=["GET", "POST"])
def register():
	if request.method == "GET":
		return render_template("register.html", title="Register")

	email = request.form.get("email")
	password = request.form.get("password")

	if not email or not password:
		return render_template("error.html", title="Error", error="Missing parameters"), 400

	db_session = Database()
	user_valid = db_session.create_user(email, password)

	if not user_valid:
		return render_template("error.html", title="Error", error="User exists"), 401

	return render_template("error.html", title="Success", error="User created"), 200

@web.route("/logout", methods=["GET"])
def logout():
	session.clear()
	return redirect("/")

@web.route("/product/<product_id>", methods=["GET"])
def product(product_id):
	if not session.get("loggedin"):
		return render_template("error.html", title="Error", error="Must have an account in order to purchase"), 200

	db_session = Database()
	product = db_session.get_product_data(product_id)

	if not product:
		return redirect("/")

	return render_template("product.html", title=product.title, product=product)

@web.route("/subs", methods=["GET"])
def subs():
	if not session.get("loggedin"):
		return redirect("/")

	db_session = Database()
	orders = db_session.get_user_orders(session["user_id"])
	return render_template("subs.html", title="My subscriptions", orders=orders), 200

@web.route("/checkout", methods=["GET"])
def checkout():
	product_id = request.args.get("product_id")
	
	if product_id and not session.get("loggedin"):
		return render_template("error.html", title="Error", error="Must have an account in order to purchase"), 200

	price = request.args.get("price")
	title = request.args.get("title")
	user_id = request.args.get("user_id")
	email = request.args.get("email")

	if not product_id and (not price or not title or not user_id or not email):
		return render_template("error.html", title="Error", error="Missing external order details"), 400

	db_session = Database()
	payment_link = None

	if product_id:
		product_data = db_session.get_product_data(product_id)
		
		if not product_data:
			return render_template("error.html", title="Error", error="Product not found"), 404

		payment_link, payment_id = generate_payment_link(product_data.price)
		order_id = db_session.create_order(product_data.title, session.get("user_id"), session.get("email"), product_data.price, payment_id, product_data.id)
		db_session.generate_invoice(order_id)

	else:
		product_data = {
			"title": title,
			"price": int(price)
		}

		payment_link, payment_id = generate_payment_link(product_data["price"])
		order_id = db_session.create_order(title, user_id, email, int(price), payment_id)
		db_session.generate_invoice(order_id)

	return redirect(payment_link)

@web.route("/checkout/success", methods=["GET"])
def checkout_success():
	order_id = request.args.get("order_id")
	payment_id = request.args.get("payment_id")

	if not order_id:
		return render_template("error.html", title="Error", error="Missing parameters"), 401	
	
	db_session = Database()
	order = db_session.get_order(order_id)
	amt_paid = get_amount_paid(payment_id)

	if amt_paid >= order.price:
		db_session.mark_order_complete(order_id)

	else:
		return render_template("error.html", title="Error", error="Could not complete order"), 401
	
	bot_runner(current_app.config["ADMIN_EMAIL"], current_app.config["ADMIN_PASS"], payment_id)
	return render_template("success.html", title="Order successful", nav=True)

@web.route("/admin", methods=["GET"])
def admin():
	if not session.get("loggedin") or session.get("role") != "admin":
		return redirect("/")

	return render_template("admin_home.html", title="Admin panel", session=session)

@web.route("/admin/users", methods=["GET"])
def admin_users():
	if not session.get("loggedin") or session.get("role") != "admin":
		return redirect("/")

	db_session = Database()
	users = db_session.get_all_users()

	return render_template("admin_users.html", title="Admin panel - Users", session=session, users=users)

@web.route("/admin/products", methods=["GET"])
def admin_products():
	if not session.get("loggedin") or session.get("role") != "admin":
		return redirect("/")

	db_session = Database()
	products = db_session.get_all_products()
	return render_template("admin_products.html", title="Admin panel - Products", session=session, products=products)

@web.route("/admin/orders", methods=["GET"])
def admin_orders():
	if not session.get("loggedin") or session.get("role") != "admin":
		return redirect("/")

	db_session = Database()
	orders = db_session.get_all_orders()

	return render_template("admin_orders.html", title="Admin panel - Orders", session=session, orders=orders)

@web.route("/admin/view-pdf", methods=["GET"])
def admin_view_pdf():
	if not session.get("loggedin") or session.get("role") != "admin":
		return redirect("/")

	pdf_url = request.args.get("url")
	
	if not pdf_url:
		return render_template("error.html", title="Error", error="Missing PDF URL"), 400
	
	try:
		response = requests.get(pdf_url)
		response.raise_for_status()
		
		if response.headers["Content-Type"] != "application/pdf":
			return render_template("error.html", title="Error", error="URL does not point to a PDF file"), 400
		
		pdf_data = BytesIO(response.content)
		return send_file(pdf_data, mimetype="application/pdf", as_attachment=False, download_name="document.pdf")

	except requests.RequestException as e:
		return render_template("error.html", title="Error", error=str(e)), 400

@web.route("/admin/api-health", methods=["GET", "POST"])
def api_health():
	if not session.get("loggedin") or session.get("role") != "admin":
		return redirect("/")
		
	if request.method == "GET":
		return render_template("admin_api_health.html", title="Admin panel - API health", session=session)

	url = request.form.get("url")

	if not url:
		return render_template("error.html", title="Error", error="Missing URL"), 400

	status_code = get_url_status_code(url)
	return render_template("admin_api_health.html", title="Admin panel - API health", session=session, status_code=status_code)

@web.route("/admin/product-stream", methods=["GET"])
def product_stream():
	if not session.get("loggedin") or session.get("role") != "admin":
		return redirect("/")

	client = ProductClient()
	new_products = client.get_new_products()
	products_dict = [{
		"id": product.id,
		"name": product.name,
		"description": product.description,
		"price": product.price
	} for product in new_products]

	return render_template("admin_product_stream.html", title="Admin panel - Product stream", session=session, products=products_dict)

@web.route("/admin/save-product", methods=["GET"])
def save_product():
	if not session.get("loggedin") or session.get("role") != "admin":
		return redirect("/")

	product_dict = request.args.get("product_dict")

	if not product_dict:
		return render_template("error.html", title="Error", error="Missing product data"), 400

	try:
		product_dict = ast.literal_eval(product_dict)
		
		if not isinstance(product_dict, dict):
			return render_template("error.html", title="Error", error="Invalid product"), 400

	except:
		return render_template("error.html", title="Error", error="Invalid product"), 400

	client = ProductClient()
	client.mark_product_saved(product_dict)

	return redirect("/admin/saved-products")

@web.route("/admin/saved-products", methods=["GET"])
def saved_products():
	if not session.get("loggedin") or session.get("role") != "admin":
		return redirect("/")

	client = ProductClient()
	products = client.get_saved_products()

	return render_template("admin_saved_products.html", title="Admin panel - Saved products", session=session, products=products)