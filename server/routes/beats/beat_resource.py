from flask_restful import Resource, Api
from flask import request, jsonify
from marshmallow import ValidationError
from server.models.beat import Beat
from server.models.beat_file import BeatFile
from server.models.discount import Discount
from server.models.contract_template import ContractTemplate
from server.schemas.beat_schema import BeatSchema
from server.extension import db
from server.service.upload_service import upload_beat_file, upload_cover_image
from server.utils.audio_utils import create_preview
from server.utils.firebase_auth import firebase_auth_required
from . import beat_resource_bp

api = Api(beat_resource_bp)

beat_schema = BeatSchema()
beats_schema = BeatSchema(many=True)


class BeatListResource(Resource):
    def get(self):
        genre = request.args.get("genre")
        query = Beat.query
        if genre:
            query = query.filter_by(genre=genre)
        beats = query.order_by(Beat.created_at.desc()).all()

      
        safe_beats = [
            {
                "id": beat.id,
                "title": beat.title,
                "genre": beat.genre,
                "bpm": beat.bpm,
                "key": beat.key,
                "cover_url": beat.cover_url,
                "preview_url": beat.preview_url,
                "price": beat.price,
                "producer": {
                    "id": beat.producer.id,
                    "name": beat.producer.name
                }
            }
            for beat in beats
        ]
        return jsonify(safe_beats)

    @firebase_auth_required
    def post(self):
        user = request.current_user
        if not user.is_producer():
            return {"error": "Only producers can upload beats"}, 403

        data = request.form.to_dict()
        data["producer_id"] = user.id 

       
        try:
            validated_data = beat_schema.load(data)
        except ValidationError as err:
            return {"errors": err.messages}, 400

        # ----- Files -----
        cover_file = request.files.get("cover")
        mp3_file = request.files.get("mp3")
        wav_file = request.files.get("wav")
        trackout_file = request.files.get("trackout")
        preview_start = int(data.get("preview_start", 0))

        if not mp3_file:
            return {"error": "MP3 file is required"}, 400

        cover_url = upload_cover_image(cover_file)["url"] if cover_file else None
        mp3_url = upload_beat_file(mp3_file)["url"]
        wav_url = upload_beat_file(wav_file)["url"] if wav_file else None
        trackout_url = upload_beat_file(trackout_file)["url"] if trackout_file else None

        preview_path = create_preview(mp3_file, start_time=preview_start)
        preview_url = upload_beat_file(open(preview_path, "rb"))["url"] if preview_path else None

   
        beat = Beat(
            **validated_data,
            cover_url=cover_url,
            preview_url=preview_url
        )
        db.session.add(beat)
        db.session.flush()

        
        db.session.add(BeatFile(file_type="mp3", file_url=mp3_url, price=beat.price, beat_id=beat.id))
        if wav_url:
            db.session.add(BeatFile(file_type="wav", file_url=wav_url, price=beat.price*1.2, beat_id=beat.id))
        if trackout_url:
            db.session.add(BeatFile(file_type="trackout", file_url=trackout_url, price=beat.price*1.5, beat_id=beat.id))

        discount_code = data.get("discount_code")
        discount_percentage = data.get("discount_percentage")
        if discount_code and discount_percentage:
            discount = Discount(
                code=discount_code,
                percentage=float(discount_percentage),
                applicable_to="beat",
                item_id=beat.id,
                is_active=True
            )
            db.session.add(discount)

      
        for file_type in ["mp3", "wav", "trackout"]:
            contract_type = data.get(f"{file_type}_contract_type")
            contract_terms = data.get(f"{file_type}_contract_terms")
            contract_price = float(data.get(f"{file_type}_contract_price", 0.0))
            if contract_type:
                contract_template = ContractTemplate(
                    beat_id=beat.id,
                    file_type=file_type,
                    contract_type=contract_type,
                    terms=contract_terms,
                    price=contract_price
                )
                db.session.add(contract_template)

        db.session.commit()
        return beat_schema.dump(beat), 201


class BeatResource(Resource):
    def get(self, beat_id):
        beat = Beat.query.get_or_404(beat_id)
        safe_beat = {
            "id": beat.id,
            "title": beat.title,
            "genre": beat.genre,
            "bpm": beat.bpm,
            "key": beat.key,
            "cover_url": beat.cover_url,
            "preview_url": beat.preview_url,
            "price": beat.price,
            "producer": {
                "id": beat.producer.id,
                "name": beat.producer.name
            },
            "discount": {
                "code": beat.discounts[0].code if beat.discounts else None,
                "percentage": beat.discounts[0].percentage if beat.discounts else None
            },
            "contracts": [
                {
                    "file_type": c.file_type,
                    "contract_type": c.contract_type,
                    "price": c.price
                } for c in beat.contract_templates
            ]
        }
        return jsonify(safe_beat)

    @firebase_auth_required
    def put(self, beat_id):
        user = request.current_user
        beat = Beat.query.get_or_404(beat_id)
        if beat.producer_id != user.id:
            return {"error": "Unauthorized"}, 403

        data = request.form.to_dict()
        data["producer_id"] = user.id  

     
        try:
            validated_data = beat_schema.load(data, partial=True)
        except ValidationError as err:
            return {"errors": err.messages}, 400

       
        for key, value in validated_data.items():
            setattr(beat, key, value)

        cover_file = request.files.get("cover")
        mp3_file = request.files.get("mp3")
        wav_file = request.files.get("wav")
        trackout_file = request.files.get("trackout")
        preview_start = int(data.get("preview_start", 0))

        if cover_file:
            beat.cover_url = upload_cover_image(cover_file)["url"]

        if mp3_file:
            mp3_url = upload_beat_file(mp3_file)["url"]
            beat.preview_url = upload_beat_file(open(create_preview(mp3_file, preview_start), "rb"))["url"]
            mp3_obj = BeatFile.query.filter_by(beat_id=beat.id, file_type="mp3").first()
            if mp3_obj:
                mp3_obj.file_url = mp3_url
            else:
                db.session.add(BeatFile(file_type="mp3", file_url=mp3_url, price=beat.price, beat_id=beat.id))

        if wav_file:
            wav_url = upload_beat_file(wav_file)["url"]
            wav_obj = BeatFile.query.filter_by(beat_id=beat.id, file_type="wav").first()
            if wav_obj:
                wav_obj.file_url = wav_url
            else:
                db.session.add(BeatFile(file_type="wav", file_url=wav_url, price=beat.price*1.2, beat_id=beat.id))

        if trackout_file:
            trackout_url = upload_beat_file(trackout_file)["url"]
            trackout_obj = BeatFile.query.filter_by(beat_id=beat.id, file_type="trackout").first()
            if trackout_obj:
                trackout_obj.file_url = trackout_url
            else:
                db.session.add(BeatFile(file_type="trackout", file_url=trackout_url, price=beat.price*1.5, beat_id=beat.id))

     
        discount_code = data.get("discount_code")
        discount_percentage = data.get("discount_percentage")
        if discount_code and discount_percentage:
            if beat.discounts:
                discount = beat.discounts[0]
                discount.code = discount_code
                discount.percentage = float(discount_percentage)
            else:
                discount = Discount(
                    code=discount_code,
                    percentage=float(discount_percentage),
                    applicable_to="beat",
                    item_id=beat.id,
                    is_active=True
                )
                db.session.add(discount)

       
        for file_type in ["mp3", "wav", "trackout"]:
            contract_type = data.get(f"{file_type}_contract_type")
            contract_terms = data.get(f"{file_type}_contract_terms")
            contract_price = float(data.get(f"{file_type}_contract_price", 0.0))

            if contract_type:
                contract_template = ContractTemplate.query.filter_by(
                    beat_id=beat.id, file_type=file_type
                ).first()
                if contract_template:
                    contract_template.contract_type = contract_type
                    contract_template.terms = contract_terms
                    contract_template.price = contract_price
                else:
                    contract_template = ContractTemplate(
                        beat_id=beat.id,
                        file_type=file_type,
                        contract_type=contract_type,
                        terms=contract_terms,
                        price=contract_price
                    )
                    db.session.add(contract_template)

        db.session.commit()
        return beat_schema.dump(beat), 200

    @firebase_auth_required
    def delete(self, beat_id):
        user = request.current_user
        beat = Beat.query.get_or_404(beat_id)
        if beat.producer_id != user.id:
            return {"error": "Unauthorized"}, 403

        db.session.delete(beat)
        db.session.commit()
        return {"message": "Beat deleted"}, 200


api.add_resource(BeatListResource, "/beats")
api.add_resource(BeatResource, "/beats/<int:beat_id>")
