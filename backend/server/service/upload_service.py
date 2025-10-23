import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from werkzeug.utils import secure_filename


load_dotenv()


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png"}
ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav"}
ALLOWED_ZIP_EXTENSIONS = {"zip"}


def allowed_file(filename, allowed_exts):
    
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts


def upload_to_cloudinary(file, folder="Beatsmart"):
   
    try:
        result = cloudinary.uploader.upload(
            file,
            resource_type="auto",  
            folder=folder
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        print("Cloudinary upload error:", e)
        raise e


def upload_cover_image(file):
    
    if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        raise ValueError("Invalid image format. Allowed: jpg, jpeg, png")

    filename = secure_filename(file.filename)
    return upload_to_cloudinary(file, folder="covers")


def upload_beat_file(file):
   
    if not allowed_file(file.filename, ALLOWED_AUDIO_EXTENSIONS):
        raise ValueError("Invalid audio format. Allowed: mp3, wav")

    filename = secure_filename(file.filename)
    return upload_to_cloudinary(file, folder="beats")


def upload_soundpack(file):
   
    if not allowed_file(file.filename, ALLOWED_ZIP_EXTENSIONS):
        raise ValueError("Soundpack must be a ZIP file")

    filename = secure_filename(file.filename)
    return upload_to_cloudinary(file, folder="soundpacks")
