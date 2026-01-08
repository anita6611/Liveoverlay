import './StreamControls.css'

function StreamControls({ rtspUrl, setRtspUrl, isStreaming, startStream, stopStream, error }) {
  return (
    <div className="control-section">
      <h2>Stream Controls</h2>

      <div className="form-group">
        <label htmlFor="rtsp-url">RTSP URL</label>
        <input
          id="rtsp-url"
          type="text"
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
          placeholder="rtsp://example.com/stream"
          disabled={isStreaming}
          className="input-field"
        />
      </div>

      <div className="button-group">
        {!isStreaming ? (
          <button
            onClick={startStream}
            className="btn btn-primary"
            disabled={!rtspUrl.trim()}
          >
            Play Stream
          </button>
        ) : (
          <button
            onClick={stopStream}
            className="btn btn-danger"
          >
            Stop Stream
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isStreaming && (
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>Streaming</span>
        </div>
      )}
    </div>
  )
}

export default StreamControls
