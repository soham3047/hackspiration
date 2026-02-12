## About the Project

Hackspiration is designed to solve the problem of identity fraud in decentralized governance. By combining **on-chain transparency** with **biometric verification**, we ensure that every vote cast is unique and tied to a real person without compromising their private keys.

# Hackspiration 

A comprehensive blockchain-powered platform featuring face recognition authentication, secure voting, and automated certificate generation.

## Key Features
* **Biometric Authentication:** Secure user login using `face-api.js` models.
* **Blockchain Integration:** Decentralized voting logic powered by Algorand (PyTeal/AlgoKit).
* **Admin Dashboard:** Full control over user profiles, voting settings, and certificate distribution.
* **Automated Certificates:** Instant generation of participation certificates for users.

##  Tech Stack
* **Frontend:** React, TypeScript, Tailwind CSS
* **Blockchain:** Algorand (AlgoKit, PyTeal)
* **AI/ML:** Face-api.js (SSD Mobilenet v1, Face Recognition models)

##  Getting Started

### Prerequisites
* Node.js (v18+)
* AlgoKit (for blockchain interaction)

### Installation
1. Clone the repo:
   ```bash
   git clone [https://github.com/soham3047/hackspiration.git](https://github.com/soham3047/hackspiration.git)

### Secure Voting Workflow
1. **Biometric Enrollment:** Users register their face descriptors using `ssd_mobilenetv1`. These models are served locally from `/public/models` to ensure fast, client-side processing.
2. **Identity Verification:** Before accessing the voting dashboard, the system performs a real-time face match.
3. **Smart Contract Interaction:** Once verified, the frontend communicates with Algorand smart contracts (via `ClubVotingClient.ts`) to record the vote. 
4. **Immutable Records:** Every vote and certificate issued is stored on the Algorand blockchain, making the results tamper-proof and publicly auditable.

###  Automated Certification
Upon completion of a voting session or a hackathon milestone, the system triggers `CertificateGeneration.tsx`. This utility uses local storage data and blockchain confirmation to generate a unique digital certificate for the user.
