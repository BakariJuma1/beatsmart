from server.extension import ma
from server.models.beat_file import BeatFile

class BeatFileSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = BeatFile
        load_instance = True
