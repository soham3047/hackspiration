import * as faceapi from '@vladmandic/face-api'

// Load models on initialization
let modelsLoaded = false

export const loadFaceModels = async () => {
  if (modelsLoaded) return

  // Use local models for faster loading and offline support
  const MODEL_URL = '/models/'

  try {
    await Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ])
    modelsLoaded = true
    console.log('Face models loaded successfully from local path')
  } catch (error) {
    console.error('Error loading face models:', error)
    throw error
  }
}

/**
 * Detect face and get face descriptor from image
 */
export const getFaceDescriptor = async (imageElement: HTMLImageElement | HTMLCanvasElement) => {
  if (!modelsLoaded) {
    await loadFaceModels()
  }

  try {
    const detections = await faceapi
      .detectSingleFace(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detections) {
      throw new Error('No face detected in the image')
    }

    return {
      descriptor: Array.from(detections.descriptor),
      age: null,
      expression: detections.expressions,
    }
  } catch (error) {
    console.error('Error detecting face:', error)
    throw error
  }
}

/**
 * Compare two face descriptors and return similarity score
 * Returns true if faces are the same person (distance < 0.6)
 */
export const compareFaceDescriptors = (descriptor1: number[], descriptor2: number[]): boolean => {
  if (descriptor1.length !== descriptor2.length) {
    console.error('Descriptor lengths do not match')
    return false
  }

  // Calculate Euclidean distance between descriptors
  let sumSquaredDifferences = 0
  for (let i = 0; i < descriptor1.length; i++) {
    const difference = descriptor1[i] - descriptor2[i]
    sumSquaredDifferences += difference * difference
  }

  const distance = Math.sqrt(sumSquaredDifferences)

  // If distance < 0.6, the faces are considered the same person
  // This threshold can be adjusted for more or less strict matching
  return distance < 0.6
}

/**
 * Get face descriptor distance for similarity percentage
 */
export const getFaceSimilarity = (descriptor1: number[], descriptor2: number[]): number => {
  if (descriptor1.length !== descriptor2.length) {
    return 0
  }

  let sumSquaredDifferences = 0
  for (let i = 0; i < descriptor1.length; i++) {
    const difference = descriptor1[i] - descriptor2[i]
    sumSquaredDifferences += difference * difference
  }

  const distance = Math.sqrt(sumSquaredDifferences)
  // Convert distance to similarity percentage (0-100)
  return Math.max(0, 100 - distance * 20)
}

/**
 * Store face for a user in localStorage
 */
export const storeFaceData = (username: string, faceDescriptor: number[]) => {
  const faceDatabase = JSON.parse(localStorage.getItem('clubVotingFaceDatabase') || '{}')
  faceDatabase[username] = {
    descriptor: faceDescriptor,
    registeredAt: new Date().toISOString(),
  }
  localStorage.setItem('clubVotingFaceDatabase', JSON.stringify(faceDatabase))
}

/**
 * Get stored face data for a user
 */
export const getFaceData = (username: string): { descriptor: number[] } | null => {
  const faceDatabase = JSON.parse(localStorage.getItem('clubVotingFaceDatabase') || '{}')
  return faceDatabase[username] || null
}

/**
 * Check if user has already voted based on face recognition
 * Prevents the same person from voting with different accounts
 */
export const checkFraudulentVote = (currentFaceDescriptor: number[], username: string): string | null => {
  const faceDatabase = JSON.parse(localStorage.getItem('clubVotingFaceDatabase') || '{}')
  const votingRecord = JSON.parse(localStorage.getItem('clubVotingRecord') || '{}')

  // Check if current user has already voted
  if (votingRecord[username]) {
    return 'You have already voted!'
  }

  // Check all other users' faces to detect fraud
  for (const [registeredUsername, faceData] of Object.entries(faceDatabase)) {
    if (registeredUsername === username) continue

    const storedDescriptor = (faceData as any).descriptor
    if (storedDescriptor && compareFaceDescriptors(currentFaceDescriptor, storedDescriptor)) {
      return `Face already used for voting by another account (${registeredUsername}). One person, one vote!`
    }
  }

  return null // No fraud detected
}

/**
 * Load image from file input
 */
export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
