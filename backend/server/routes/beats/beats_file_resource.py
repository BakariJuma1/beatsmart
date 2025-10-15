from flask_restful import Resource, Api
from flask import jsonify, request
from server.models.beat_file import BeatFile
from server.models.beat import Beat
from server.models.sale import Sale
from server.models.contract import Contract
from server.extension import db
from server.utils.firebase_auth import firebase_auth_required
from server.utils.role import ROLES
from . import beat_resource_bp

api = Api(beat_resource_bp)


class BeatFileResource(Resource):
    @firebase_auth_required
    def get(self, beat_id, file_type):
        """
        Allows producer or buyer with valid purchase to access the file.
        """
        user = request.current_user
        beat = Beat.query.get_or_404(beat_id)
        beat_file = BeatFile.query.filter_by(beat_id=beat_id, file_type=file_type).first()

        if not beat_file:
            return jsonify({"error": f"No {file_type} file found for this beat"}), 404

        if user.role == ROLES["ADMIN"] and user.id == beat.producer_id:
            return jsonify({
                "file_url": beat_file.file_url,
                "contract_url": None
            }), 200

      
        sale = Sale.query.filter_by(
            beat_id=beat_id, buyer_id=user.id, file_type=file_type
        ).first()

        if not sale:
            return jsonify({"error": "You have not purchased this file"}), 403

        contract = Contract.query.filter_by(
            beat_id=beat_id, buyer_id=user.id, file_type=file_type
        ).first()

        return jsonify({
            "file_url": beat_file.file_url,
            "contract_url": contract.contract_url if contract else None
        }), 200


api.add_resource(BeatFileResource, "/beats/<int:beat_id>/files/<string:file_type>")
