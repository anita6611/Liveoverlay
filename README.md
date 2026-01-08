# RTSP Livestream Overlay Web Application

A full-stack monorepo application for streaming RTSP video feeds with customizable overlays. Add, drag, resize, and manage text and image overlays in real-time over your video streams.

## Project Overview

This application converts RTSP video streams to HLS format for web playback and provides an intuitive interface for adding overlays on top of the video. Perfect for adding branding, timestamps, or other visual elements to live video feeds.

## Tech Stack

### Backend
- **Python Flask**: Web framework for REST APIs
- **PyMongo**: MongoDB driver for data persistence
- **MongoDB**: Database for storing overlay configurations
- **FFmpeg**: Video transcoding from RTSP to HLS
- **Flask-CORS**: Cross-origin resource sharing support

### Frontend
- **React**: UI framework
- **Vite**: Build tool and development server
- **hls.js**: HLS video playback in the browser
- **react-rnd**: Draggable and resizable components for overlays

## Project Structure

```
liveoverlay/
├── backend/
│   ├── app.py                 # Flask application and API endpoints
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   ├── .gitignore            # Backend git ignore rules
│   └── static/
│       └── hls/              # Generated HLS stream files
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── OverlayManager.jsx
│   │   │   ├── StreamControls.jsx
│   │   │   └── OverlayControls.jsx
│   │   ├── App.jsx           # Main application component
│   │   ├── main.jsx          # Application entry point
│   │   └── index.css         # Global styles
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── index.html            # HTML template
│   └── .gitignore            # Frontend git ignore rules
└── README.md                 # This file
```

## Prerequisites

Before running this application, ensure you have the following installed:

- **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 16+**: [Download Node.js](https://nodejs.org/)
- **MongoDB**: [Download MongoDB](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **FFmpeg**: [Download FFmpeg](https://ffmpeg.org/download.html)

### Installing FFmpeg

#### macOS
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to your PATH.

## Environment Variables

### Backend

Create a `.env` file in the `backend/` directory:

```env
MONGODB_URI=mongodb://localhost:27017/
```

For MongoDB Atlas, use your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/liveoverlay
```

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file:
```bash
cp .env.example .env
```

6. Start MongoDB (if running locally):
```bash
mongod
```

7. Run the Flask application:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage Guide

1. **Open the application** in your browser at `http://localhost:3000`

2. **Enter RTSP URL**: Input your RTSP stream URL in the text field
   - Example: `rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4`

3. **Start Streaming**: Click the "Play Stream" button
   - The backend will convert the RTSP stream to HLS
   - Video will start playing in the browser

4. **Add Overlays**:
   - Select overlay type (Text or Image)
   - For text: Enter the text content
   - For image: Enter an image URL
   - Click "Add Overlay"

5. **Manage Overlays**:
   - **Drag**: Click and drag an overlay to reposition it
   - **Resize**: Drag the corners/edges to resize
   - **Delete**: Click the × button on the overlay or in the overlay list

6. **Stop Streaming**: Click "Stop Stream" when finished

## API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### Create Overlay
```http
POST /overlays
Content-Type: application/json

{
  "type": "text",
  "text": "Sample Text",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 50
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "type": "text",
  "text": "Sample Text",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 50
}
```

#### Get All Overlays
```http
GET /overlays
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "type": "text",
    "text": "Sample Text",
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 50
  }
]
```

#### Update Overlay
```http
PUT /overlays/{id}
Content-Type: application/json

{
  "x": 150,
  "y": 150,
  "width": 250,
  "height": 60
}
```

#### Delete Overlay
```http
DELETE /overlays/{id}
```

#### Start Stream
```http
POST /stream/start
Content-Type: application/json

{
  "rtsp_url": "rtsp://example.com/stream"
}
```

**Response:**
```json
{
  "message": "Stream started successfully",
  "hls_url": "/static/hls/stream.m3u8"
}
```

#### Stop Stream
```http
POST /stream/stop
```

## How RTSP to HLS Streaming Works

### The Process

1. **RTSP Input**: The application receives an RTSP stream URL from the user

2. **FFmpeg Conversion**: The backend uses FFmpeg to:
   - Connect to the RTSP stream using TCP transport
   - Decode the incoming video
   - Re-encode to H.264 video codec
   - Convert audio to AAC codec
   - Package into HLS format (m3u8 playlist + TS segments)

3. **HLS Output**: FFmpeg generates:
   - `stream.m3u8`: Master playlist file
   - `segment000.ts`, `segment001.ts`, etc.: Video segments (2 seconds each)

4. **Web Delivery**: Flask serves the HLS files as static content

5. **Browser Playback**: The frontend uses hls.js to:
   - Parse the m3u8 playlist
   - Download and play video segments sequentially
   - Handle adaptive streaming

### FFmpeg Command Breakdown

```bash
ffmpeg \
  -rtsp_transport tcp \           # Use TCP for reliability
  -i rtsp://source \              # Input RTSP stream
  -c:v libx264 \                  # H.264 video codec
  -preset veryfast \              # Fast encoding
  -tune zerolatency \             # Minimize latency
  -c:a aac \                      # AAC audio codec
  -f hls \                        # HLS output format
  -hls_time 2 \                   # 2-second segments
  -hls_list_size 5 \              # Keep 5 segments in playlist
  -hls_flags delete_segments \    # Remove old segments
  -hls_segment_filename segment%03d.ts \
  stream.m3u8
```

## Testing with Sample RTSP Streams

Use these public RTSP streams for testing:

1. **Big Buck Bunny** (Low Quality):
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

2. **Big Buck Bunny** (Medium Quality):
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_175k.mp4
```

## Recording a Local Demo Video

To create your own RTSP stream for testing:

### Using VLC Media Player

1. **Install VLC**: [Download VLC](https://www.videolan.org/)

2. **Open VLC**: Media → Stream

3. **Add your video file**: Click "Add" and select a video

4. **Click "Stream"**: Click the "Stream" button

5. **Configure Stream**:
   - Destination: RTSP
   - Port: 8554
   - Path: /stream

6. **Start Streaming**: Your RTSP URL will be:
```
rtsp://localhost:8554/stream
```

### Using FFmpeg

Create an RTSP server with FFmpeg:

1. **Start an RTSP server** (requires additional tools like MediaMTX/rtsp-simple-server)

2. **Push video to server**:
```bash
ffmpeg -re -i your-video.mp4 -c copy -f rtsp rtsp://localhost:8554/stream
```

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- For MongoDB Atlas, whitelist your IP address

**FFmpeg Not Found**
- Verify FFmpeg is installed: `ffmpeg -version`
- Add FFmpeg to your system PATH

**Stream Won't Start**
- Verify the RTSP URL is accessible
- Check firewall settings
- Try a different RTSP transport (TCP/UDP)

### Frontend Issues

**Video Not Playing**
- Wait 5-10 seconds after starting the stream
- Check browser console for errors
- Ensure backend is running and accessible
- Verify HLS files are being generated in `backend/static/hls/`

**Overlays Not Appearing**
- Check browser console for API errors
- Verify MongoDB connection
- Ensure overlay data is being saved

**CORS Errors**
- Backend should have Flask-CORS enabled
- Check Vite proxy configuration in `vite.config.js`

## Development

### Backend Development

The Flask app runs in debug mode by default. Changes to Python files will automatically reload the server.

To run without debug mode:
```python
app.run(host='0.0.0.0', port=5000, debug=False)
```

### Frontend Development

Vite provides hot module replacement. Changes to React components will update instantly in the browser.

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Database Schema

### Overlays Collection

```javascript
{
  _id: ObjectId,
  type: String,          // "text" | "image"
  text: String,          // Text content (for text overlays)
  imageUrl: String,      // Image URL (for image overlays)
  x: Number,             // X position (pixels)
  y: Number,             // Y position (pixels)
  width: Number,         // Width (pixels)
  height: Number         // Height (pixels)
}
```

## License

MIT

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## Support

For issues and questions, please open a GitHub issue.