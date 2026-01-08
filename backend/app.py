import os
import subprocess
import threading
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGODB_URI)
db = client['liveoverlay']
overlays_collection = db['overlays']

HLS_DIR = os.path.join(os.path.dirname(__file__), 'static', 'hls')
os.makedirs(HLS_DIR, exist_ok=True)

ffmpeg_process = None


def serialize_overlay(overlay):
    if overlay:
        overlay['id'] = str(overlay['_id'])
        del overlay['_id']
    return overlay


@app.route('/overlays', methods=['POST'])
def create_overlay():
    try:
        data = request.json

        overlay = {
            'type': data.get('type'),
            'text': data.get('text'),
            'imageUrl': data.get('imageUrl'),
            'x': data.get('x', 0),
            'y': data.get('y', 0),
            'width': data.get('width', 100),
            'height': data.get('height', 50)
        }

        result = overlays_collection.insert_one(overlay)
        overlay['id'] = str(result.inserted_id)
        del overlay['_id']

        return jsonify(overlay), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/overlays', methods=['GET'])
def get_overlays():
    try:
        overlays = list(overlays_collection.find())
        return jsonify([serialize_overlay(o) for o in overlays]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/overlays/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    try:
        data = request.json

        update_fields = {}
        if 'type' in data:
            update_fields['type'] = data['type']
        if 'text' in data:
            update_fields['text'] = data['text']
        if 'imageUrl' in data:
            update_fields['imageUrl'] = data['imageUrl']
        if 'x' in data:
            update_fields['x'] = data['x']
        if 'y' in data:
            update_fields['y'] = data['y']
        if 'width' in data:
            update_fields['width'] = data['width']
        if 'height' in data:
            update_fields['height'] = data['height']

        result = overlays_collection.update_one(
            {'_id': ObjectId(overlay_id)},
            {'$set': update_fields}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Overlay not found'}), 404

        updated_overlay = overlays_collection.find_one({'_id': ObjectId(overlay_id)})
        return jsonify(serialize_overlay(updated_overlay)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/overlays/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    try:
        result = overlays_collection.delete_one({'_id': ObjectId(overlay_id)})

        if result.deleted_count == 0:
            return jsonify({'error': 'Overlay not found'}), 404

        return jsonify({'message': 'Overlay deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def run_ffmpeg(rtsp_url):
    global ffmpeg_process

    output_path = os.path.join(HLS_DIR, 'stream.m3u8')

    for file in os.listdir(HLS_DIR):
        file_path = os.path.join(HLS_DIR, file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception:
            pass

    cmd = [
        'ffmpeg',
        '-rtsp_transport', 'tcp',
        '-i', rtsp_url,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-tune', 'zerolatency',
        '-c:a', 'aac',
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '5',
        '-hls_flags', 'delete_segments',
        '-hls_segment_filename', os.path.join(HLS_DIR, 'segment%03d.ts'),
        output_path
    ]

    ffmpeg_process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


@app.route('/stream/start', methods=['POST'])
def start_stream():
    try:
        data = request.json
        rtsp_url = data.get('rtsp_url')

        if not rtsp_url:
            return jsonify({'error': 'rtsp_url is required'}), 400

        global ffmpeg_process
        if ffmpeg_process:
            ffmpeg_process.terminate()
            ffmpeg_process = None

        thread = threading.Thread(target=run_ffmpeg, args=(rtsp_url,))
        thread.daemon = True
        thread.start()

        return jsonify({'message': 'Stream started successfully', 'hls_url': '/static/hls/stream.m3u8'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/stream/stop', methods=['POST'])
def stop_stream():
    try:
        global ffmpeg_process
        if ffmpeg_process:
            ffmpeg_process.terminate()
            ffmpeg_process = None
            return jsonify({'message': 'Stream stopped successfully'}), 200
        return jsonify({'message': 'No active stream'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/static/hls/<path:filename>')
def serve_hls(filename):
    return send_from_directory(HLS_DIR, filename)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
