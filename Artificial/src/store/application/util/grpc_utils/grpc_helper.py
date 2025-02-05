import grpc, threading, time
import application.util.grpc_utils.product_pb2 as product_pb2
import application.util.grpc_utils.product_pb2_grpc as product_pb2_grpc

class ProductClient:
	def __init__(self, host="127.0.0.1", port=50051):
		self.channel = grpc.insecure_channel(f"{host}:{port}")
		self.stub = product_pb2_grpc.ProductServiceStub(self.channel)
		self.new_products = []

	def get_new_products(self):
		response = self.stub.GetNewProducts(product_pb2.Empty())
		return response.products

	def mark_product_saved(self, product):
		product_message = product_pb2.Product(
			id=product["id"],
			name=product["name"],
			description=product["description"],
			price=product["price"]
		)
		return self.stub.MarkProductSaved(product_message)
		
	def get_saved_products(self):
		response = self.stub.GetSavedProducts(product_pb2.Empty())
		return response.products
