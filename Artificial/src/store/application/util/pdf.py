from fpdf import FPDF

class PDFInvoice(FPDF):
    def header(self):
        self.set_font("Arial", "B", 12)
        self.cell(0, 10, "Invoice", 0, 1, "C")

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", 0, 0, "C")

    def invoice_body(self, order, user, product):
        self.set_font("Arial", "", 12)
        self.cell(0, 10, f"Order ID: {order.id}", 0, 1)
        self.cell(0, 10, f"Payment ID: {order.payment_id}", 0, 1)
        self.cell(0, 10, f"Date: {order.date_created.strftime("%Y-%m-%d")}", 0, 1)
        self.cell(0, 10, f"User: {user.email}", 0, 1)
        self.cell(0, 10, f"Product: {product.title}", 0, 1)
        self.cell(0, 10, f"Price: ${order.price}", 0, 1)
        self.cell(0, 10, f"Completed: {"Yes" if order.completed else "No"}", 0, 1)
