# System Architecture & Workflow Diagrams

## 1. Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI["React UI<br/>Components"]
        TS["TypeScript<br/>Logic"]
    end
    
    subgraph "Business Logic Layer"
        AUTH["Authentication<br/>Manager"]
        VOTING["Voting<br/>System"]
        CERT["Certificate<br/>Generator"]
        FACE["Face<br/>Recognition"]
    end
    
    subgraph "Storage Layer"
        LOCAL["LocalStorage<br/>Browser Data"]
        CACHE["Session<br/>Cache"]
    end
    
    subgraph "Blockchain Layer"
        ALGO["Algorand<br/>Network"]
        ALGOD["Algod<br/>RPC"]
        INDEXER["Indexer<br/>API"]
    end
    
    UI --> TS
    TS --> AUTH
    TS --> VOTING
    TS --> CERT
    TS --> FACE
    
    AUTH --> LOCAL
    VOTING --> LOCAL
    CERT --> LOCAL
    FACE --> LOCAL
    
    VOTING --> ALGOD
    VOTING --> INDEXER
    AUTH --> ALGO
    
    ALGOD --> ALGO
    INDEXER --> ALGO
    
    style UI fill:#e1f5ff
    style TS fill:#e1f5ff
    style AUTH fill:#fff3e0
    style VOTING fill:#f3e5f5
    style CERT fill:#e8f5e9
    style FACE fill:#fce4ec
    style LOCAL fill:#f5f5f5
    style ALGO fill:#c8e6c9
```

---

## 2. Component Architecture Diagram

```mermaid
graph LR
    subgraph "Frontend Components"
        HOME["Home.tsx"]
        LOGIN["LoginRegister"]
        CONNECT["ConnectWallet"]
        
        subgraph "User Dashboard"
            VOTING_DASH["UserVotingDashboard"]
            ADMIN_DASH["AdminDashboard"]
        end
        
        subgraph "Voting Components"
            USER_PROFILE["UserProfile.tsx"]
            ADMIN_PROFILE["AdminProfile.tsx"]
            FACE_REC["FaceRecognition.tsx"]
        end
        
        subgraph "Certificate Components"
            CERT_GEN["CertificateGeneration.tsx"]
            QUEST["Questionnaire.tsx"]
        end
        
        subgraph "Utilities"
            CERT_STORAGE["certificateStorage.ts"]
            CERT_UTILS["certificateUtils.ts"]
            FACE_UTILS["faceRecognition.ts"]
            NETWORK["getAlgoClientConfigs.ts"]
        end
        
        subgraph "Contracts"
            VOTING_CLIENT["ClubVotingClient.ts"]
            COUNTER_CLIENT["Counter.ts"]
        end
    end
    
    HOME --> LOGIN
    LOGIN --> CONNECT
    LOGIN --> VOTING_DASH
    LOGIN --> ADMIN_DASH
    
    VOTING_DASH --> USER_PROFILE
    VOTING_DASH --> CERT_GEN
    ADMIN_DASH --> ADMIN_PROFILE
    
    USER_PROFILE --> FACE_REC
    FACE_REC --> FACE_UTILS
    
    CERT_GEN --> QUEST
    CERT_GEN --> CERT_STORAGE
    QUEST --> CERT_STORAGE
    CERT_GEN --> CERT_UTILS
    
    USER_PROFILE --> VOTING_CLIENT
    ADMIN_PROFILE --> VOTING_CLIENT
    VOTING_CLIENT --> NETWORK
    
    style HOME fill:#bbdefb
    style LOGIN fill:#bbdefb
    style VOTING_DASH fill:#c8e6c9
    style ADMIN_DASH fill:#f8bbd0
    style CERT_GEN fill:#fff9c4
    style FACE_REC fill:#ffccbc
    style NETWORK fill:#d1c4e9
```

---

## 3. Voting System Workflow

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Component
    participant Auth as Auth Manager
    participant Face as Face Recognition
    participant Voting as Voting Logic
    participant Blockchain as Blockchain
    participant Storage as LocalStorage
    
    User->>UI: 1. Open Voting Tab
    UI->>Auth: 2. Verify User Status
    Auth-->>UI: 3. Return User Role
    
    User->>UI: 4. Click Start Camera
    UI->>Face: 5. Request Face Recognition
    Face->>Face: 6. Load ML Models
    Face-->>UI: 7. Live Camera Feed
    
    User->>UI: 8. Capture Face Photo
    UI->>Face: 9. Detect & Extract Face
    Face->>Storage: 10. Compare with Stored Data
    Storage-->>Face: 11. Face Descriptor Data
    Face-->>UI: 12. Return Match Result
    
    rect rgb(200, 230, 201)
        alt Face Verified
            UI->>UI: 13. Enable Voting Buttons
        else Face Not Verified
            UI->>UI: 13. Show Error Message
            UI->>User: 14. Ask to Retry
        end
    end
    
    User->>UI: 15. Select Candidate
    UI->>Voting: 16. Process Vote
    Voting->>Blockchain: 17. Submit Transaction
    Blockchain-->>Voting: 18. Tx Receipt
    Voting->>Storage: 19. Save Vote Record
    Storage-->>Voting: 20. Confirm Saved
    Voting-->>UI: 21. Return Success
    UI->>User: 22. Show Success Msg
```

---

## 4. Certificate Generation Workflow

```mermaid
sequenceDiagram
    participant User
    participant UI as Certificate UI
    participant Validator as File Validator
    participant Quiz as Quiz Engine
    participant Generator as Generator
    participant Canvas as Canvas API
    participant Storage as LocalStorage
    participant User_Storage as Browser Storage
    
    User->>UI: 1. Click Certificate Tab
    UI-->>User: 2. Show Upload Form
    
    User->>UI: 3. Select Workshop Name
    User->>UI: 4. Upload Document
    UI->>Validator: 5. Validate File
    
    rect rgb(255, 204, 188)
        alt Valid File
            Validator-->>UI: 6. File Accepted
        else Invalid
            Validator-->>UI: 6. Show Error
            UI->>User: 7. Request Retry
        end
    end
    
    User->>UI: 8. Click Proceed to Quiz
    UI->>Quiz: 9. Load Questions
    Storage-->>Quiz: 10. Get Quiz Data
    Quiz-->>UI: 11. Display Q1
    
    loop For Each Question
        User->>UI: 12. Select Answer
        UI->>Quiz: 13. Validate Answer
    end
    
    User->>UI: 14. Submit Quiz
    Quiz->>Quiz: 15. Calculate Score
    
    rect rgb(200, 230, 201)
        alt Score >= 70%
            Quiz-->>Generator: 16. Generate Certificate
            Generator->>Canvas: 17. Create Certificate Image
            Canvas-->>Generator: 18. Return Image Data
            Generator->>Storage: 19. Save Certificate Data
            Storage-->>Generator: 20. Confirm Saved
            Generator-->>UI: 21. Display Certificate
            UI->>User_Storage: 22. Save in History
            UI-->>User: 23. Show Download Button
        else Score < 70%
            Quiz-->>UI: 16. Show Score & Review
            UI-->>User: 17. Offer Retry Option
        end
    end
    
    User->>UI: 24. Click Download
    UI->>Canvas: 25. Retrieve Image
    Canvas-->>UI: 26. Return Data URL
    UI->>User: 27. Trigger Download
```

---

## 5. Data Flow Diagram

```mermaid
graph TD
    subgraph "Input Sources"
        USER_INPUT["User Input<br/>Forms & Actions"]
        WALLET["Wallet<br/>Connection"]
        CAMERA["Camera<br/>Stream"]
        FILE["File<br/>Upload"]
    end
    
    subgraph "Processing Layer"
        VALIDATION["Input Validation<br/>& Sanitization"]
        ENCODING["Data Encoding<br/>& Transformation"]
        VERIFICATION["Verification<br/>& Authentication"]
        GENERATION["Content Generation<br/>& Rendering"]
    end
    
    subgraph "Storage Layer"
        INDEXEDDB["IndexedDB<br/>Optional"]
        LOCALSTORAGE["LocalStorage<br/>Primary"]
        SESSION_STORAGE["SessionStorage<br/>Temporary"]
    end
    
    subgraph "Output Destinations"
        UI_RENDER["UI Rendering<br/>& Display"]
        BLOCKCHAIN["Blockchain<br/>Submission"]
        DOWNLOAD["File Downloads<br/>& Export"]
    end
    
    USER_INPUT --> VALIDATION
    WALLET --> VALIDATION
    CAMERA --> VALIDATION
    FILE --> VALIDATION
    
    VALIDATION --> ENCODING
    ENCODING --> VERIFICATION
    VERIFICATION --> GENERATION
    
    GENERATION --> LOCALSTORAGE
    GENERATION --> SESSION_STORAGE
    LOCALSTORAGE --> UI_RENDER
    
    UI_RENDER --> BLOCKCHAIN
    GENERATION --> DOWNLOAD
    
    BLOCKCHAIN --> LOCALSTORAGE
    
    style USER_INPUT fill:#e3f2fd
    style WALLET fill:#e3f2fd
    style CAMERA fill:#e3f2fd
    style FILE fill:#e3f2fd
    style VALIDATION fill:#fff9c4
    style ENCODING fill:#fff9c4
    style VERIFICATION fill:#fff9c4
    style GENERATION fill:#fff9c4
    style LOCALSTORAGE fill:#f5f5f5
    style UI_RENDER fill:#c8e6c9
    style DOWNLOAD fill:#c8e6c9
```

---

## 6. Face Recognition Pipeline

```mermaid
graph LR
    subgraph "Input"
        VIDEO["Video Stream<br/>from Camera"]
    end
    
    subgraph "Face Detection & Processing"
        MODELS["Load Face Models<br/>from /models/"]
        DETECT["Detect Face<br/>in Frame"]
        EXTRACT["Extract Face<br/>Descriptor<br/>128-dimensional"]
        COMPARE["Compare with<br/>Stored Descriptor"]
    end
    
    subgraph "Decision"
        DISTANCE["Calculate<br/>Euclidean Distance"]
        THRESHOLD["Check Distance<br/>< 0.6"]
    end
    
    subgraph "Output"
        STORE["Store New<br/>Descriptor"]
        VERIFY["Mark User<br/>as Verified"]
        REJECT["Request<br/>Retry"]
    end
    
    VIDEO --> MODELS
    MODELS --> DETECT
    DETECT --> EXTRACT
    EXTRACT --> COMPARE
    COMPARE --> DISTANCE
    DISTANCE --> THRESHOLD
    
    THRESHOLD -->|New Face| STORE
    THRESHOLD -->|Match| VERIFY
    THRESHOLD -->|No Match| REJECT
    
    STORE --> VERIFY
    
    style VIDEO fill:#ffccbc
    style MODELS fill:#fff9c4
    style DETECT fill:#fff9c4
    style COMPARE fill:#fff9c4
    style VERIFY fill:#c8e6c9
    style REJECT fill:#ffcdd2
    style STORE fill:#b3e5fc
```

---

## 7. Certificate Generation Canvas Architecture

```mermaid
graph TB
    subgraph "Input Data"
        USERNAME["Username<br/>john_doe"]
        WORKSHOP["Workshop Name<br/>Web3 Fundamentals"]
        SCORE["Quiz Score<br/>85%"]
        CERT_ID["Certificate ID<br/>CERT-12345-xyz"]
        DATE["Issue Date<br/>2026-02-12"]
    end
    
    subgraph "Canvas Rendering Engine"
        CANVAS["Create Canvas<br/>1200x800px"]
        BG["Draw Background<br/>Gradient"]
        BORDER["Draw Decorative<br/>Borders"]
        TEXT["Render Text<br/>Elements"]
        DATA["Insert Dynamic<br/>Data"]
    end
    
    subgraph "Output"
        PNG["Convert to PNG<br/>Data URL"]
        DOWNLOAD["Generate<br/>Download Link"]
        PREVIEW["Display in<br/>UI Preview"]
        STORE["Save to<br/>LocalStorage"]
    end
    
    USERNAME --> CANVAS
    WORKSHOP --> CANVAS
    SCORE --> CANVAS
    CERT_ID --> CANVAS
    DATE --> CANVAS
    
    CANVAS --> BG
    BG --> BORDER
    BORDER --> TEXT
    TEXT --> DATA
    
    DATA --> PNG
    PNG --> DOWNLOAD
    PNG --> PREVIEW
    PNG --> STORE
    
    DOWNLOAD --> User["📥 User Download"]
    PREVIEW --> Browser["🖥️ Browser View"]
    STORE --> History["📜 Certificate History"]
    
    style CANVAS fill:#e1f5fe
    style TEXT fill:#fff9c4
    style PNG fill:#c8e6c9
    style User fill:#b3e5fc
    style Browser fill:#b3e5fc
    style History fill:#b3e5fc
```

---

## 8. User Authentication & Role-Based Flow

```mermaid
graph TD
    START["User Arrives<br/>at App"]
    
    START --> CHECK{User<br/>Authenticated?}
    
    CHECK -->|No| LOGIN["Show Login<br/>Register Form"]
    LOGIN --> WALLET["Connect<br/>Wallet?"]
    WALLET -->|Yes| WALLET_UI["Show Wallet<br/>Selection"]
    WALLET_UI --> VERIFY["Verify Wallet<br/>Signature"]
    VERIFY --> SIGNUP["Create Account<br/>& Set Role"]
    WALLET -->|No| SIGNUP
    
    CHECK -->|Yes| ROLE{Check<br/>User Role}
    SIGNUP --> ROLE
    
    ROLE -->|User| USER_DASH["Load User<br/>Voting Dashboard"]
    ROLE -->|Admin| ADMIN_DASH["Load Admin<br/>Dashboard"]
    
    USER_DASH --> USER_TABS["Show 2 Tabs:<br/>Voting | Certificate"]
    ADMIN_DASH --> ADMIN_TABS["Show Admin<br/>Controls"]
    
    USER_TABS --> VOTING_TAB["Click Voting Tab"]
    USER_TABS --> CERT_TAB["Click Certificate Tab"]
    
    VOTING_TAB --> VOTE_FLOW["Face Verify → Vote<br/>Process"]
    CERT_TAB --> CERT_FLOW["Upload → Quiz<br/>→ Certificate"]
    
    VOTE_FLOW --> LOGOUT["Logout"]
    CERT_FLOW --> LOGOUT
    ADMIN_TABS --> LOGOUT
    
    LOGOUT --> START
    
    style START fill:#bbdefb
    style LOGIN fill:#f8bbd0
    style WALLET fill:#ffe0b2
    style USER_DASH fill:#c8e6c9
    style ADMIN_DASH fill:#f8bbd0
    style VOTING_TAB fill:#c8e6c9
    style CERT_TAB fill:#fff9c4
    style LOGOUT fill:#ffccbc
```

---

## 9. LocalStorage Data Structure

```mermaid
graph TB
    ROOT["Browser LocalStorage"]
    
    ROOT --> VOTING["clubVotingCandidates<br/>Array of Candidates"]
    ROOT --> VOTING_RECORD["clubVotingRecord<br/>Map: User → Candidate"]
    ROOT --> VOTING_SETTINGS["clubVotingSettings<br/>Admin Settings"]
    ROOT --> FACE_DATA["faceData<br/>Map: User → Descriptor"]
    ROOT --> ATTEMPT_COUNT["faceRecAttempts<br/>Track Attempts"]
    
    ROOT --> CERTIFICATES["certificates<br/>Map: User → []"]
    ROOT --> QUIZ_QUESTIONS["quizQuestions<br/>Array of Questions"]
    ROOT --> QUIZ_ATTEMPTS["quizAttempts<br/>Array of Attempts"]
    
    CERTIFICATES --> CERT_CHILD["Certificate Data<br/>{workshopName,<br/>date, score,<br/>certificateId}"]
    FACE_DATA --> FACE_CHILD["Descriptor<br/>[128 numbers]"]
    QUIZ_QUESTIONS --> QUIZ_CHILD["Question Data<br/>{question,<br/>options,<br/>correctAnswer}"]
    
    style ROOT fill:#ffeb3b
    style VOTING fill:#c8e6c9
    style CERTIFICATES fill:#fff9c4
    style FACE_DATA fill:#ffccbc
    style QUIZ_QUESTIONS fill:#f8bbd0
```

---

## 10. Complete User Journey Map

```mermaid
journey
    title Complete User Journey
    section Sign Up & Login
      User arrives at app: 5: User
      Sees login form: 5: User
      Connects wallet: 4: User
      Registers as user: 5: User
    section Voting Process
      Navigates to voting: 5: User
      Starts face recognition: 4: User
      Captures face: 3: User
      Face verified: 5: User
      Views candidates: 4: User
      Casts vote: 5: User
    section Certificate Process
      Clicks certificate tab: 5: User
      Uploads document: 4: User
      Enters workshop name: 5: User
      Proceeds to quiz: 4: User
      Answers question 1: 3: User
      Answers question 2: 3: User
      Answers question 3: 3: User
      Submits quiz: 5: User
      Receives score feedback: 5: User, System
      Downloads certificate: 5: User
    section Post Activity
      Views certificate history: 4: User
      Logs out: 5: User
```

---

## System Statistics

| Component | Type | Count | Status |
|-----------|------|-------|--------|
| React Components | UI | 12+ | ✅ Active |
| Utility Files | Logic | 6+ | ✅ Active |
| Smart Contracts | Blockchain | 2 | ✅ Deployed |
| Quiz Questions | Content | 3 | ✅ Customizable |
| Storage Types | Data | 3 | ✅ Integrated |
| API Endpoints | Network | 4+ | ✅ Connected |

---

## Technology Stack

```
Frontend:
├── React 18.2
├── TypeScript 5.1
├── Tailwind CSS + DaisyUI
├── Face-API (Face Recognition)
└── Vite (Build Tool)

Smart Contracts:
├── Python (PyTeal)
├── Algorand
└── AlgoKit

Storage:
├── LocalStorage (Primary)
├── Canvas API (Generation)
└── Session Cache (Temporary)

APIs:
├── Algod (Node)
├── Indexer (Query)
├── KMD (Wallet)
└── Face-API (Browser ML)
```

---

## Key Integration Points

### 1. **Wallet Connection**
- User connects Algorand wallet (Pera, Defly, etc.)
- Transaction signing enabled
- Address retrieved for blockchain interactions

### 2. **Face Recognition**
- Models loaded from `/public/models/`
- Real-time face detection via camera
- Descriptor storage in LocalStorage

### 3. **Voting Smart Contract**
- ClubVotingClient interacts with blockchain
- Vote submission via signed transaction
- Result indexing for display

### 4. **Certificate Generation**
- Canvas API creates visual certificate
- PNG export for download
- Metadata stored in LocalStorage

### 5. **Quiz Engine**
- Questions loaded from storage
- Real-time scoring
- Attempt tracking

---

## Error Handling Flow

```mermaid
graph TD
    ERROR["Error Detected"]
    
    ERROR --> TYPE{Error Type?}
    
    TYPE -->|File Upload| FILE_ERR["Validate:<br/>- Type<br/>- Size<br/>- Format"]
    FILE_ERR --> FILE_MSG["Show User:<br/>Cannot upload<br/>[reason]"]
    
    TYPE -->|Face Recognition| FACE_ERR["Check:<br/>- Camera access<br/>- Model load<br/>- Face detect"]
    FACE_ERR --> FACE_MSG["Show User:<br/>Face error<br/>[reason]"]
    
    TYPE -->|Quiz| QUIZ_ERR["Validate:<br/>- Answer select<br/>- Score calc"]
    QUIZ_ERR --> QUIZ_MSG["Show User:<br/>Quiz error<br/>[reason]"]
    
    TYPE -->|Blockchain| CHAIN_ERR["Check:<br/>- Network<br/>- Transaction<br/>- Signature"]
    CHAIN_ERR --> CHAIN_MSG["Show User:<br/>TX failed<br/>[reason]"]
    
    FILE_MSG --> RETRY["Offer Retry"]
    FACE_MSG --> RETRY
    QUIZ_MSG --> RETRY
    CHAIN_MSG --> RETRY
    
    RETRY --> USER["User<br/>Continues"]
```

---

**Last Updated:** February 12, 2026
**Version:** 2.0
