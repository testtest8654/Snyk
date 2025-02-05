import time, product_pb2, product_pb2_grpc, random, uuid, grpc, sys
from concurrent import futures

class ProductService(product_pb2_grpc.ProductServiceServicer):
	def __init__(self):
		self.saved_products = []
		self.max_products = 3
		self.min_price = 10
		self.max_price = 100

	def UpdateService(self, source, destination):
		for key, value in source.items(): 
			if hasattr(destination, "__dict__") and key in destination.__dict__ and isinstance(value, dict): 
				self.UpdateService(value, destination.__dict__[key]) 
			elif hasattr(destination, "__dict__"): 
				destination.__dict__[key] = value 
			elif isinstance(destination, dict) and key in destination and isinstance(value, dict): 
				self.UpdateService(value, destination[key]) 
			else: 
				destination[key] = value

	def GenerateProduct(self):
		if hasattr(self, "price_formula"):
			price = eval(self.price_formula)
			product = product_pb2.Product(
				id=str(uuid.uuid4()),
				name=f"Product {random.randint(1, 100)}",
				description="A sample product",
				price=price
			)
			return product

		else:
			product = product_pb2.Product(
				id=str(uuid.uuid4()),
				name=f"Product {random.randint(1, 100)}",
				description="A sample product",
				price=random.uniform(self.min_price, self.max_price)
			)
			return product

	def GetNewProducts(self, request, context):
		new_products = []
		for i in range(random.randint(0, 3)):
			new_products.append(self.GenerateProduct())
		return product_pb2.Products(products=new_products)

	def MarkProductSaved(self, request, context):
		if len(self.saved_products) >= self.max_products:
			self.saved_products.pop(0)
		self.saved_products.append(request)
		return product_pb2.Empty()

	def GetSavedProducts(self, request, context):
		return product_pb2.Products(products=self.saved_products)

	def DebugService(self, request, context):
		input_dict = {k: v.string_value for k, v in request.input.items()}
		self.UpdateService(input_dict, self)
		return product_pb2.Empty()

def serve():
	server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
	product_pb2_grpc.add_ProductServiceServicer_to_server(ProductService(), server)
	server.add_insecure_port("[::]:50051")
	server.start()
	server.wait_for_termination()

if __name__ == "__main__":
	serve()
