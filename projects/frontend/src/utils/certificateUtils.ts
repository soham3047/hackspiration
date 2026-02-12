// Certificate generation utilities for PDF/Image export
export const generateCertificatePDF = async (
  username: string,
  workshopName: string,
  certificateId: string,
  score: number
): Promise<string> => {
  // Create a canvas for the certificate
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not create canvas context')
  }

  // Set canvas size (landscape A4 equivalent)
  canvas.width = 1200
  canvas.height = 800

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#e0f7fa')
  gradient.addColorStop(1, '#80deea')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw decorative border
  ctx.strokeStyle = '#00838f'
  ctx.lineWidth = 8
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

  // Inner decorative border
  ctx.strokeStyle = '#0097a7'
  ctx.lineWidth = 4
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)

  // Draw header
  ctx.fillStyle = '#004d5c'
  ctx.font = 'bold 60px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Certificate of Completion', canvas.width / 2, 140)

  // Draw main content
  ctx.fillStyle = '#00838f'
  ctx.font = '28px Arial'
  ctx.fillText('This is to certify that', canvas.width / 2, 250)

  // Username/Name
  ctx.fillStyle = '#004d5c'
  ctx.font = 'bold 48px Arial'
  ctx.fillText(username, canvas.width / 2, 340)

  // Achievement text
  ctx.fillStyle = '#00838f'
  ctx.font = '24px Arial'
  ctx.fillText(`has successfully completed the`, canvas.width / 2, 420)

  // Workshop Name
  ctx.fillStyle = '#004d5c'
  ctx.font = 'bold 36px Arial'
  ctx.fillText(workshopName, canvas.width / 2, 490)

  // Score information
  ctx.fillStyle = '#00838f'
  ctx.font = '20px Arial'
  ctx.fillText(`Final Score: ${score}%`, canvas.width / 2, 560)

  // Certificate ID
  ctx.fillStyle = '#666666'
  ctx.font = '14px Arial'
  ctx.fillText(`Certificate ID: ${certificateId}`, canvas.width / 2, 630)

  // Date
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  ctx.fillStyle = '#666666'
  ctx.font = '14px Arial'
  ctx.fillText(`Date: ${dateStr}`, canvas.width / 2, 670)

  // Convert canvas to image/data URL
  return canvas.toDataURL('image/png')
}

export const downloadCertificate = (dataUrl: string, username: string, workshopName: string) => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `Certificate_${workshopName.replace(/\s+/g, '_')}_${username}_${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const openCertificateInNewWindow = (dataUrl: string) => {
  const newWindow = window.open()
  if (newWindow) {
    newWindow.document.write(`<img src="${dataUrl}" style="width:100%; height:100%;" />`)
  }
}
