import React, { useState, useRef, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import Questionnaire from './Questionnaire'
import {
  saveCertificateData,
  getCertificates,
  deleteCertificate,
  CertificateData,
} from '../utils/certificateStorage'
import { generateCertificatePDF, downloadCertificate, openCertificateInNewWindow } from '../utils/certificateUtils'

interface CertificateGenerationProps {
  username: string
}

type Stage = 'upload' | 'questionnaire' | 'complete' | 'history'

const CertificateGeneration: React.FC<CertificateGenerationProps> = ({ username }) => {
  const { enqueueSnackbar } = useSnackbar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('upload')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [workshopName, setWorkshopName] = useState('')
  const [quizScore, setQuizScore] = useState(0)
  const [quizPassed, setQuizPassed] = useState(false)
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
  const [certificateImage, setCertificateImage] = useState<string | null>(null)
  const [certificates, setCertificates] = useState<CertificateData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = () => {
    const certs = getCertificates(username)
    setCertificates(certs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar('Please upload a valid document (PDF, Image, or Word)', { variant: 'error' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('File size must be less than 5MB', { variant: 'error' })
      return
    }

    setUploadedFile(file)
    enqueueSnackbar('Document uploaded successfully!', { variant: 'success' })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const proceedToQuiz = () => {
    if (!workshopName.trim()) {
      enqueueSnackbar('Please enter the workshop name', { variant: 'warning' })
      return
    }

    if (!uploadedFile) {
      enqueueSnackbar('Please upload a document', { variant: 'warning' })
      return
    }

    setStage('questionnaire')
  }

  const handleQuizComplete = (score: number, passed: boolean) => {
    setQuizScore(score)
    setQuizPassed(passed)

    if (passed) {
      generateCertificate(score)
    } else {
      // Still allow them to see the results but don't generate certificate
      setStage('questionnaire')
    }
  }

  const generateCertificate = async (score: number) => {
    setLoading(true)
    try {
      // Generate certificate image
      const imageData = await generateCertificatePDF(username, workshopName, '', score)
      setCertificateImage(imageData)

      // Save certificate data
      const certData = saveCertificateData(username, {
        workshopName,
        date: new Date().toISOString(),
        score,
        status: 'completed',
      })

      setCertificateData(certData)
      setStage('complete')
      enqueueSnackbar('Certificate generated successfully!', { variant: 'success' })
      loadCertificates()
    } catch (error) {
      enqueueSnackbar(`Error generating certificate: ${(error as Error).message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = () => {
    if (!certificateImage) return
    downloadCertificate(certificateImage, username, workshopName)
  }

  const handleViewCertificate = (image: string) => {
    openCertificateInNewWindow(image)
  }

  const handleDeleteCertificate = (certificateId: string) => {
    if (confirm('Are you sure you want to delete this certificate?')) {
      deleteCertificate(username, certificateId)
      loadCertificates()
      enqueueSnackbar('Certificate deleted', { variant: 'info' })
    }
  }

  const handleRestart = () => {
    setUploadedFile(null)
    setWorkshopName('')
    setQuizScore(0)
    setQuizPassed(false)
    setCertificateData(null)
    setCertificateImage(null)
    setStage('upload')
  }

  const handleRetrieveCertificateImage = async (cert: CertificateData) => {
    setLoading(true)
    try {
      const imageData = await generateCertificatePDF(username, cert.workshopName, cert.certificateId, cert.score)
      handleViewCertificate(imageData)
    } catch (error) {
      enqueueSnackbar(`Error retrieving certificate: ${(error as Error).message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Upload Stage
  if (stage === 'upload') {
    return (
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-2xl text-purple-700 flex items-center gap-2">
            📜 Certificate of Completion
          </h3>
          <div className="divider my-2"></div>

          <div className="space-y-4">
            {/* Workshop Name Input */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Workshop Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter workshop name (e.g., 'Web3 Fundamentals')"
                className="input input-bordered w-full"
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Upload Workshop Document</span>
                <span className="label-text-alt text-xs text-gray-500">PDF, Image, or Word (Max 5MB)</span>
              </label>

              <div
                onClick={handleUploadClick}
                className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="space-y-2">
                    <p className="text-2xl">✓</p>
                    <p className="font-semibold text-green-600">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUploadClick()
                      }}
                      className="btn btn-sm btn-outline btn-primary mt-2"
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-4xl">📁</p>
                    <p className="font-semibold text-purple-700">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-600">PDF, JPG, PNG, or Word documents</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>Upload your workshop attendance document to proceed with the verification questionnaire.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button onClick={proceedToQuiz} className="btn btn-primary flex-1" disabled={!uploadedFile || !workshopName.trim()}>
                Proceed to Questionnaire →
              </button>
            </div>

            {/* Certificate History */}
            {certificates.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-bold mb-3">📜 Your Certificates</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {certificates.map((cert) => (
                    <div key={cert.certificateId} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">{cert.workshopName}</p>
                        <p className="text-xs text-gray-500">{new Date(cert.date).toLocaleDateString()} • Score: {cert.score}%</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRetrieveCertificateImage(cert)}
                          className="btn btn-sm btn-ghost"
                          disabled={loading}
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleDeleteCertificate(cert.certificateId)}
                          className="btn btn-sm btn-ghost text-error"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Questionnaire Stage
  if (stage === 'questionnaire') {
    return (
      <Questionnaire
        username={username}
        workshopName={workshopName}
        onQuizComplete={handleQuizComplete}
        onCancel={() => setStage('upload')}
      />
    )
  }

  // Certificate Complete Stage
  if (stage === 'complete' && certificateImage && certificateData) {
    return (
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-2xl text-center text-purple-700 mb-4">🎓 Congratulations!</h3>

          <div className="text-center mb-6">
            <p className="text-lg text-gray-700">Your certificate has been generated</p>
            <p className="text-sm text-gray-600">Final Score: <span className="font-bold text-green-600">{quizScore}%</span></p>
          </div>

          {/* Certificate Preview */}
          <div className="border-2 border-purple-300 rounded-lg overflow-hidden mb-6">
            <img src={certificateImage} alt="Certificate" className="w-full" />
          </div>

          {/* Certificate Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-gray-600">Recipient</p>
              <p className="font-semibold">{username}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-gray-600">Workshop</p>
              <p className="font-semibold">{workshopName}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-gray-600">Certificate ID</p>
              <p className="font-semibold text-xs">{certificateData.certificateId}</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-gray-600">Date</p>
              <p className="font-semibold">{new Date(certificateData.date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={handleDownloadCertificate} disabled={loading} className="btn btn-success flex-1">
              {loading ? <span className="loading loading-spinner loading-sm"></span> : '⬇️ Download Certificate'}
            </button>
            <button onClick={handleRestart} className="btn btn-outline">
              New Certificate
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default CertificateGeneration
