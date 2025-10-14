from flask_restful import Resource, Api
from flask import jsonify,request
from server.models.beat_file import BeatFile
from server.models.beat import Beat
from server.models.sale import Sale
from server.models.contract import Contract
from server.extension import db
from server.utils.firebase_auth import firebase_auth_required
from . import beat_resource_bp

api = Api(beat_resource_bp)


class BeatFileResource(Resource):
    @firebase_auth_required
    def get(self, beat_id, file_type):
        user = request.current_user
        beat = Beat.query.get_or_404(beat_id)
        beat_file = BeatFile.query.filter_by(beat_id=beat_id, file_type=file_type).first()

        if not beat_file:
            return {"error": f"No {file_type} file found for this beat"}, 404

       
        if user.id == beat.producer_id:
            return jsonify({"file_url": beat_file.file_url, "contract_url": None})

        sale = Sale.query.filter_by(beat_id=beat_id, buyer_id=user.id, file_type=file_type).first()
        if not sale:
            return {"error": "You have not purchased this file"}, 403

       
        contract = Contract.query.filter_by(beat_id=beat_id, buyer_id=user.id, file_type=file_type).first()
        contract_url = contract.contract_url if contract else None

        return jsonify({"file_url": beat_file.file_url, "contract_url": contract_url})


api.add_resource(BeatFileResource, "/beats/<int:beat_id>/files/<string:file_type>")
