import { Rnd } from 'react-rnd'
import './OverlayManager.css'

function OverlayManager({ overlays, updateOverlay, deleteOverlay }) {
  const handleDragStop = (id, d) => {
    updateOverlay(id, { x: d.x, y: d.y })
  }

  const handleResizeStop = (id, ref, position) => {
    updateOverlay(id, {
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height),
      x: position.x,
      y: position.y
    })
  }

  return (
    <div className="overlay-manager">
      {overlays.map((overlay) => (
        <Rnd
          key={overlay.id}
          default={{
            x: overlay.x,
            y: overlay.y,
            width: overlay.width,
            height: overlay.height
          }}
          bounds="parent"
          onDragStop={(e, d) => handleDragStop(overlay.id, d)}
          onResizeStop={(e, direction, ref, delta, position) =>
            handleResizeStop(overlay.id, ref, position)
          }
          className="overlay-rnd"
        >
          <div className="overlay-content">
            {overlay.type === 'text' ? (
              <div className="text-overlay">
                {overlay.text}
              </div>
            ) : (
              <img
                src={overlay.imageUrl}
                alt="Overlay"
                className="image-overlay"
              />
            )}
            <button
              onClick={() => deleteOverlay(overlay.id)}
              className="overlay-delete-btn"
              title="Delete overlay"
            >
              &times;
            </button>
          </div>
        </Rnd>
      ))}
    </div>
  )
}

export default OverlayManager
