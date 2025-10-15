
from fpdf import FPDF
import tempfile
from server.service.upload_service import upload_to_cloudinary

def generate_contract_pdf(template, buyer, beat, file_type):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    pdf.multi_cell(0, 10, f"Contract Type: {template.contract_type}")
    pdf.multi_cell(0, 10, f"Buyer: {buyer.name}")
    pdf.multi_cell(0, 10, f"Beat: {beat.title}")
    pdf.multi_cell(0, 10, f"File Type: {file_type}")
    pdf.multi_cell(0, 10, f"Price: {template.price}")
    pdf.multi_cell(0, 10, f"Terms:\n{template.terms}")

    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf.output(tmp_file.name)

   
    upload_result = upload_to_cloudinary(tmp_file.name, folder="contracts")
    return upload_result["url"]
