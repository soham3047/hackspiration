import React, { useRef, useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import {
  loadFaceModels,
  getFaceDescriptor,
  storeFaceData,
  getFaceData,
  checkFraudulentVote,
} from '../utils/faceRecognition'

interface FaceRecognitionProps {
  username: string
  onFaceVerified: (isNewFace: boolean) => void
  onVerificationFailed: (reason: string) => void
  disabled?: boolean
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({
  username,
  onFaceVerified,
  onVerificationFailed,
  disabled = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [faceCaptured, setFaceCaptured] = useState(false)
  const [modelsLoading, setModelsLoading] = useState(true)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraInitializing, setCameraInitializing] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  // Load models on component mount
  useEffect(() => {
    const initModels = async () => {
      try {
        setModelsLoading(true)
        await loadFaceModels()
        setModelsLoading(false)
      } catch (error) {
        enqueueSnackbar('Error loading face recognition models. Please refresh the page.', {
          variant: 'error',
        })
        setModelsLoading(false)
      }
    }

    initModels()
  }, [enqueueSnackbar])

  const startCamera = async () => {
    try {
      if (cameraActive || cameraInitializing) return // Already active or initializing
      
      setCameraInitializing(true)
      console.log('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Small delay to ensure stream is ready
        setTimeout(() => {
          setCameraActive(true)
          setCameraInitializing(false)
        }, 100)
      }
    } catch (error) {
      console.error('Camera error:', error)
      const errorMsg = (error as any).name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access in your browser settings.' 
        : 'Unable to access camera. Please check browser permissions.'
      enqueueSnackbar(errorMsg, { variant: 'error' })
      setCameraActive(false)
      setCameraInitializing(false)
    }
  }

  const capturePhotoFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setLoading(true)
    try {
      const context = canvasRef.current.getContext('2d')
      if (context && videoRef.current.videoWidth > 0) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        await processFaceImage(canvasRef.current)
      }
    } catch (error) {
      enqueueSnackbar(`Error capturing photo: ${(error as Error).message}`, {
        variant: 'error',
      })
      setLoading(false)
    }
  }

  const processFaceImage = async (imageElement: HTMLCanvasElement) => {
    try {
      setLoading(true)

      // Get face descriptor
      const faceResult = await getFaceDescriptor(imageElement)
      const currentDescriptor = faceResult.descriptor

      // Check for fraudulent activity
      const fraudCheck = checkFraudulentVote(currentDescriptor, username)

      if (fraudCheck) {
        // Fraud detected
        onVerificationFailed(fraudCheck)
        resetFaceCapture()
        return
      }

      // Check if user already has a registered face
      const existingFaceData = getFaceData(username)

      if (existingFaceData) {
        // User has already registered a face, just verify it matches
        enqueueSnackbar('✓ Face verified! Proceeding to voting...', { variant: 'success' })
        onFaceVerified(false) // Not a new face
      } else {
        // New face - store it
        storeFaceData(username, currentDescriptor)
        enqueueSnackbar('✓ Face registered! You can now vote.', { variant: 'success' })
        onFaceVerified(true) // New face registered
      }

      setFaceCaptured(true)
      stopCamera()
    } catch (error) {
      const errorMsg = (error as Error).message
      if (errorMsg.includes('No face detected')) {
        enqueueSnackbar('No face detected. Please ensure your face is clearly visible and try again.', {
          variant: 'warning',
        })
      } else {
        enqueueSnackbar(`Error processing face: ${errorMsg}`, { variant: 'error' })
      }
      resetFaceCapture()
    } finally {
      setLoading(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      setCameraActive(false)
    }
  }
  const resetFaceCapture = () => {
    setFaceCaptured(false)
    setCameraInitializing(false)
    stopCamera()
  }

  if (modelsLoading) {
    return (
      <div className="card bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg border-2 border-cyan-200">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span>Loading face recognition system...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg border-2 border-cyan-200">
      <div className="card-body">
        <h3 className="card-title text-lg flex items-center gap-2">
          <span>🔐 Face Verification</span>
          {faceCaptured && <span className="badge badge-success">Verified</span>}
        </h3>
        <div className="divider my-2"></div>

        {faceCaptured ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✓</div>
            <p className="text-teal-700 font-semibold mb-2">Face Verified Successfully!</p>
            <p className="text-sm text-gray-600 mb-4">
              Your face has been registered for this voting session.
            </p>
            <button
              onClick={resetFaceCapture}
              className="btn btn-sm btn-outline"
              disabled={disabled}
            >
              Verify Different Face
            </button>
          </div>
        ) : cameraActive ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 font-medium">Position your face in the camera and click capture.</p>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border-2 border-cyan-300 bg-black aspect-video"
            />
            <div className="flex gap-2">
              <button
                onClick={capturePhotoFromCamera}
                disabled={loading}
                className="btn btn-success flex-1"
              >
                {loading ? <span className="loading loading-spinner loading-sm"></span> : '📷 Capture'}
              </button>
              <button
                onClick={() => {
                  stopCamera()
                }}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              To prevent fraud, please verify your face before voting. This ensures one person = one vote.
            </p>
            <button
              type="button"
              onClick={startCamera}
              disabled={cameraInitializing || disabled}
              className="btn btn-primary w-full text-base py-3 cursor-pointer"
            >
              {cameraInitializing ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Starting Camera...
                </>
              ) : (
                '📷 Start Live Camera'
              )}
            </button>
          </div>
        )}

        {/* Hidden canvas for face capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

export default FaceRecognition
