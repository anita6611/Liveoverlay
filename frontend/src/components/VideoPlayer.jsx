import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import './VideoPlayer.css'

function VideoPlayer({ hlsUrl, isStreaming }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    if (!isStreaming || !hlsUrl) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      return
    }

    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      })

      hls.loadSource(hlsUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => console.error('Playback error:', err))
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error, trying to recover...')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error, trying to recover...')
              hls.recoverMediaError()
              break
            default:
              console.error('Fatal error, destroying HLS instance')
              hls.destroy()
              break
          }
        }
      })

      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => console.error('Playback error:', err))
      })
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [hlsUrl, isStreaming])

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        className="video-element"
        controls
        muted
      />
      {!isStreaming && (
        <div className="video-placeholder">
          <p>Enter RTSP URL and click Play to start streaming</p>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
