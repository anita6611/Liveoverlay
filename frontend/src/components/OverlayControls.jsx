import { useState } from 'react'
import './OverlayControls.css'

function OverlayControls({ addOverlay, overlays, deleteOverlay }) {
  const [overlayType, setOverlayType] = useState('text')
  const [textContent, setTextContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const handleAddOverlay = () => {
    if (overlayType === 'text' && !textContent.trim()) return
    if (overlayType === 'image' && !imageUrl.trim()) return

    const overlayData = {
      type: overlayType,
      x: 50,
      y: 50,
      width: overlayType === 'text' ? 200 : 150,
      height: overlayType === 'text' ? 50 : 100
    }

    if (overlayType === 'text') {
      overlayData.text = textContent
    } else {
      overlayData.imageUrl = imageUrl
    }

    addOverlay(overlayData)

    setTextContent('')
    setImageUrl('')
  }

  return (
    <div className="control-section">
      <h2>Overlay Controls</h2>

      <div className="form-group">
        <label>Overlay Type</label>
        <select
          value={overlayType}
          onChange={(e) => setOverlayType(e.target.value)}
          className="input-field"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>
      </div>

      {overlayType === 'text' ? (
        <div className="form-group">
          <label htmlFor="text-content">Text Content</label>
          <input
            id="text-content"
            type="text"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter text..."
            className="input-field"
          />
        </div>
      ) : (
        <div className="form-group">
          <label htmlFor="image-url">Image URL</label>
          <input
            id="image-url"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            className="input-field"
          />
        </div>
      )}

      <button
        onClick={handleAddOverlay}
        className="btn btn-success"
        disabled={
          (overlayType === 'text' && !textContent.trim()) ||
          (overlayType === 'image' && !imageUrl.trim())
        }
      >
        Add Overlay
      </button>

      {overlays.length > 0 && (
        <div className="overlay-list">
          <h3>Active Overlays</h3>
          {overlays.map((overlay) => (
            <div key={overlay.id} className="overlay-item">
              <div className="overlay-info">
                <span className="overlay-type">{overlay.type}</span>
                <span className="overlay-content">
                  {overlay.type === 'text'
                    ? overlay.text?.substring(0, 20)
                    : 'Image'}
                </span>
              </div>
              <button
                onClick={() => deleteOverlay(overlay.id)}
                className="btn-delete"
                title="Delete overlay"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OverlayControls
