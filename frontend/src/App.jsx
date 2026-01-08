import { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'
import VideoPlayer from './components/VideoPlayer'
import OverlayManager from './components/OverlayManager'
import StreamControls from './components/StreamControls'
import OverlayControls from './components/OverlayControls'
import './App.css'

const API_BASE_URL = '/api'

function App() {
  const [rtspUrl, setRtspUrl] = useState('rtsp://example.com/stream')
  const [isStreaming, setIsStreaming] = useState(false)
  const [hlsUrl, setHlsUrl] = useState('')
  const [overlays, setOverlays] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOverlays()
  }, [])

  const fetchOverlays = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/overlays`)
      if (response.ok) {
        const data = await response.json()
        setOverlays(data)
      }
    } catch (err) {
      console.error('Failed to fetch overlays:', err)
    }
  }

  const startStream = async () => {
    try {
      setError('')
      const response = await fetch(`${API_BASE_URL}/stream/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rtsp_url: rtspUrl })
      })

      if (response.ok) {
        const data = await response.json()
        setHlsUrl(`http://localhost:5000${data.hls_url}`)
        setIsStreaming(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to start stream')
      }
    } catch (err) {
      setError('Failed to connect to backend')
      console.error('Stream start error:', err)
    }
  }

  const stopStream = async () => {
    try {
      await fetch(`${API_BASE_URL}/stream/stop`, { method: 'POST' })
      setIsStreaming(false)
      setHlsUrl('')
    } catch (err) {
      console.error('Failed to stop stream:', err)
    }
  }

  const addOverlay = async (overlayData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/overlays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overlayData)
      })

      if (response.ok) {
        const newOverlay = await response.json()
        setOverlays([...overlays, newOverlay])
      }
    } catch (err) {
      console.error('Failed to add overlay:', err)
    }
  }

  const updateOverlay = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/overlays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedOverlay = await response.json()
        setOverlays(overlays.map(o => o.id === id ? updatedOverlay : o))
      }
    } catch (err) {
      console.error('Failed to update overlay:', err)
    }
  }

  const deleteOverlay = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/overlays/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setOverlays(overlays.filter(o => o.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete overlay:', err)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>RTSP Livestream Overlay</h1>
      </header>

      <div className="app-content">
        <div className="controls-panel">
          <StreamControls
            rtspUrl={rtspUrl}
            setRtspUrl={setRtspUrl}
            isStreaming={isStreaming}
            startStream={startStream}
            stopStream={stopStream}
            error={error}
          />

          <OverlayControls
            addOverlay={addOverlay}
            overlays={overlays}
            deleteOverlay={deleteOverlay}
          />
        </div>

        <div className="video-container">
          <VideoPlayer hlsUrl={hlsUrl} isStreaming={isStreaming} />

          {isStreaming && (
            <OverlayManager
              overlays={overlays}
              updateOverlay={updateOverlay}
              deleteOverlay={deleteOverlay}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
