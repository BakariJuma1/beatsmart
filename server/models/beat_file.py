from server.extension import db

class BeatFile(db.Model):
    __tablename__ = "beat_files"

    id = db.Column(db.Integer, primary_key=True)
    file_type = db.Column(db.String(20), nullable=False)  
    file_url = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False, default=0.0)
    beat_id = db.Column(db.Integer, db.ForeignKey("beats.id"), nullable=False)

    beat = db.relationship("Beat", back_populates="files")

    def __repr__(self):
        return f"<BeatFile {self.file_type} - {self.file_url}>"
