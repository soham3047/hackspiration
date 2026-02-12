# Certificate Generation Feature - User & Admin Guide

## 📋 Overview

A new **Certificate Generation System** has been integrated into your voting application. This feature allows users to:
- Upload workshop attendance documents
- Answer a 3-question questionnaire to verify knowledge
- Generate downloadable certificates upon passing
- Track all generated certificates

---

## 🎯 Features

### For Users:
✅ Document Upload (PDF, Image, Word)
✅ 3-Question Verification Quiz (Pass threshold: 70%)
✅ Automatic Certificate Generation upon passing
✅ Certificate Download & Preview
✅ Certificate History & Management

### For Admins:
✅ Customize quiz questions and answers
✅ View all user certificates
✅ Set passing score thresholds

---

## 📚 How to Use

### User Workflow

#### 1. **Accessing Certificate Feature**
- Log in to your account
- Click on the **"📜 Certificate"** tab in the navigation menu
- You'll see the certificate generation interface

#### 2. **Upload Workshop Document**
```
Steps:
1. Enter the Workshop Name (e.g., "Web3 Fundamentals")
2. Click the upload area or drag & drop a document
3. Supported formats: PDF, JPEG, PNG, DOC, DOCX
4. Maximum file size: 5 MB
```

#### 3. **Complete the Questionnaire**
```
After clicking "Proceed to Questionnaire":
1. You'll receive 3 multiple-choice questions
2. Each question tests your knowledge of the workshop content
3. You must answer all questions before submitting
4. Pass threshold: 70% (at least 2 out of 3 correct)
```

**Default Quiz Questions:**
- Q1: What is blockchain technology used for?
- Q2: What does a smart contract do?
- Q3: What is the primary benefit of decentralization?

#### 4. **Generate Certificate**
```
Upon passing (≥70%):
1. Your certificate is automatically generated
2. Certificate displays: Name, Workshop, Score, Date, Unique ID
3. Download the certificate as an image (PNG)
4. Certificate is saved in your history
```

#### 5. **View Certificate History**
- All generated certificates appear at the bottom of the upload section
- Click 👁️ to preview any certificate
- Click 🗑️ to delete a certificate

---

## 📜 Certificate Details

### What's Included in Certificate:
- **Recipient Name**: Your username
- **Workshop Name**: The workshop you completed
- **Final Score**: Your quiz result percentage
- **Certificate ID**: Unique identifier (format: CERT-timestamp-random)
- **Date**: Issue date of the certificate

### Certificate Format:
- Beautiful gradient design with decorative borders
- Professional layout with teal and cyan color scheme
- Downloadable as PNG image
- High resolution suitable for printing or sharing

---

## 🎓 Admin Customization

### Customize Quiz Questions

Edit the default questions by accessing `src/utils/certificateStorage.ts`:

```typescript
const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Your question here',
    options: [
      'A. Option 1',
      'B. Option 2',
      'C. Option 3',
      'D. Option 4',
    ],
    correctAnswer: 'A', // Letter of correct option
    explanation: 'Why this answer is correct',
  },
  // Add more questions...
]
```

### Custom Passing Score

Change the passing threshold (default: 70%):

In `src/components/Questionnaire.tsx`, line ~145:
```typescript
const passed = calculatedScore >= 70 // Change 70 to your desired threshold
```

---

## 📊 Data Storage

### LocalStorage Keys Used:
- `certificates` - Stores all generated certificates with metadata
- `quizQuestions` - Store custom quiz questions
- `quizAttempts` - Track all quiz attempts by users

### Data Structure:

**Certificate Data:**
```json
{
  "username": {
    "username": "john_doe",
    "workshopName": "Web3 Basics",
    "date": "2026-02-12T...",
    "certificateId": "CERT-123456-abc",
    "score": 85,
    "status": "completed"
  }
}
```

---

## 🔧 Technical Details

### New Files Created:

1. **Frontend Components:**
   - `src/components/CertificateGeneration.tsx` - Main certificate UI
   - `src/components/Questionnaire.tsx` - Quiz interface

2. **Utility Files:**
   - `src/utils/certificateStorage.ts` - LocalStorage management
   - `src/utils/certificateUtils.ts` - Certificate PDF/Image generation

3. **Updated Files:**
   - `src/components/UserVotingDashboard.tsx` - Added certificate tab

### Dependencies Used:
- React hooks (useState, useEffect, useRef)
- Canvas API for certificate image generation
- LocalStorage for data persistence
- Notistack for notifications

---

## 🎨 UI/UX Features

### Color Scheme:
- **Voting Section**: Cyan/Teal gradient
- **Certificate Section**: Purple/Pink gradient
- Consistent with existing DaisyUI themes

### User Feedback:
- Success notifications for completed actions
- Warning messages for incomplete inputs
- Error handling for file upload & generation
- Progress bar showing quiz progress

---

## 📱 Responsive Design

- ✅ Works on mobile, tablet, and desktop
- ✅ Touch-friendly buttons and inputs
- ✅ Responsive grid layouts
- ✅ Full-width certificate preview

---

## 🔐 Security & Validation

### File Upload Validation:
✓ File type checking (only PDF, Image, Word)
✓ File size limit (max 5 MB)
✓ Prevents malicious file uploads

### Quiz Security:
✓ Answer validation before submission
✓ Score calculation verification
✓ Attempt tracking in localStorage

### Certificate Integrity:
✓ Unique certificate IDs
✓ Timestamp-based tracking
✓ User-specific certificate storage

---

## 🚀 Future Enhancements

Potential improvements (not yet implemented):
- PDF export with official letterhead
- Email delivery of certificates
- QR code for certificate verification
- Blockchain-based certificate verification
- Multiple certificate templates
- Admin dashboard to manage all user certificates

---

## ❓ FAQ

**Q: Can I retake the quiz if I don't pass?**
A: Yes! Go back to the upload section and try again by uploading the same/different document.

**Q: How long are my certificates stored?**
A: Certificates are stored in your browser's localStorage indefinitely until you delete them.

**Q: Can I delete a certificate I generated?**
A: Yes, click the 🗑️ button next to any certificate in the history.

**Q: What if I lose my browser data?**
A: Certificates are stored locally. Clear browser data will remove them. Consider downloading certificates immediately.

**Q: Can I share my certificate with others?**
A: Yes! Download the certificate and share the image file. The unique ID ensures authenticity.

**Q: Is there a way to verify a certificate's authenticity?**
A: Currently, the unique certificate ID and timestamp serve as verification. Future versions may include blockchain verification.

---

## 📞 Support

For issues or questions about the certificate feature:
1. Check your browser's console for error messages
2. Ensure JavaScript is enabled
3. Try clearing browser cache and reloading
4. Make sure you're using a supported file format

---

## 📈 Compliance & Best Practices

✅ Document your workshop attendance
✅ Keep certificates for your records
✅ Share only with intended recipients
✅ Verify certificate authenticity before relying on it for official purposes
✅ Follow your organization's certificate policies

---

**Last Updated:** February 12, 2026
**Feature Version:** 1.0
