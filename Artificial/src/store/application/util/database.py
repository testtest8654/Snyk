import bcrypt, datetime, random

from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base

from application.util.pdf import PDFInvoice

Base = declarative_base()

class Users(Base):
	__tablename__ = "users"
	id = Column(Integer, primary_key=True)
	email = Column(String)
	password = Column(String)
	role = Column(String)

class Products(Base):
	__tablename__ = "products"
	id = Column(Integer, primary_key=True)
	price = Column(Float)
	title = Column(String)
	description = Column(String)
	
class Orders(Base):
	__tablename__ = "orders"
	id = Column(Integer, primary_key=True)
	user_id = Column(Integer)
	user_email = Column(String)
	product_id = Column(Integer)
	product_title = Column(String)
	price = Column(Float)
	date_created = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
	completed = Column(Boolean, default=False)
	payment_id = Column(String)

class Database:
	def __init__(self):
		engine = create_engine(f"sqlite:///storage.db", echo=False)
		Base.metadata.create_all(engine)
		Session = sessionmaker(bind=engine)
		session = Session()
		self.session = session

	def migrate(self, admin_email, admin_pass):
		self.create_user(admin_email, admin_pass, "admin")
		self.create_product(1337, "External Product", "Template for external product")
		self.create_product(20, "Artificial University Subscription", "Monthly subscription")
		self.create_product(100, "Artificial University Subscription", "Yearly subscription")
	
	def create_user(self, email, password, role="user"):
		user = self.session.query(Users).filter(Users.email == email).first()
		if user:
			return False

		password_bytes = password.encode("utf-8")
		salt = bcrypt.gensalt()
		password_hash = bcrypt.hashpw(password_bytes, salt).decode()

		new_user = Users(email=email, password=password_hash, role=role)
		self.session.add(new_user)
		self.session.commit()

		return True
	
	def check_user(self, email, password):
		user = self.session.query(Users).filter(Users.email == email).first()

		if not user:
			return False, None
		
		password_bytes = password.encode("utf-8")
		password_encoded = user.password.encode("utf-8")
		matched = bcrypt.checkpw(password_bytes, password_encoded)
		
		if matched:
			return True, user
		
		return False, None

	def get_all_users(self):
		users = self.session.query(Users).all()
		return users

	def create_product(self, price, title, description):
		new_product = Products(price=price, title=title, description=description)
		self.session.add(new_product)
		self.session.commit()
		return True

	def get_all_products(self):
		products = self.session.query(Products).all()
		return products

	def get_product_data(self, product_id):
		product = self.session.query(Products).filter(Products.id == product_id).first()

		if not product:
			return False

		return product

	def create_order(self, product_title, user_id, user_email, price, payment_id, product_id=1):
		new_order = Orders(product_title=product_title, user_id=user_id, user_email=user_email, price=price, payment_id=payment_id, product_id=product_id)
		self.session.add(new_order)
		self.session.commit()
		return new_order.id

	def get_order(self, order_id):
		orders = self.session.query(Orders).filter(Orders.id == order_id).one()
		return orders

	def get_all_orders(self):
		orders = self.session.query(Orders).all()
		return orders

	def get_user_orders(self, user_id):
		orders = self.session.query(Orders).filter(Orders.user_id == user_id).all()
		return orders

	def mark_order_complete(self, order_id):
		order = self.session.query(Orders).filter(Orders.id == order_id).first()
		if order:
			order.completed = True
			self.session.commit()

	def generate_invoice(self, order_id):
		order = self.session.query(Orders).filter(Orders.id == order_id).first()
		if not order:
			return False

		user = self.session.query(Users).filter(Users.id == order.user_id).first()
		product = self.session.query(Products).filter(Products.id == order.product_id).first()

		if not user or not product:
			return False

		pdf = PDFInvoice()
		pdf.add_page()
		pdf.invoice_body(order, user, product)
		pdf_file_path = f"/app/store/application/static/invoices/invoice_{order.payment_id}.pdf"
		pdf.output(pdf_file_path)

		return pdf_file_path