# DocuProof — Blockchain Document Verification

DocuProof is a full-stack blockchain application that registers document fingerprints on a blockchain and verifies whether an uploaded file matches a previously registered document.

Instead of storing entire documents on-chain, DocuProof computes a SHA-256 hash and stores that fingerprint in a Solidity smart contract. This helps detect changes to a file after registration.

> **Status:** Working local development prototype. The current version uses a local Hardhat blockchain and a Django REST API with a React frontend.

## Features

- Register document hashes on the blockchain.
- Verify documents by comparing their SHA-256 fingerprints.
- Detect modified files through hash mismatches.
- Prevent duplicate document registrations.
- Retrieve registration status, owner address, timestamp, and transaction details.
- Upload documents through a React user interface.
- Expose document operations through a Django REST API.
- Test smart contract behavior using automated tests.

## Technology Stack

| Component | Technologies |
|---|---|
| Smart contracts | Solidity |
| Blockchain development | Hardhat |
| Backend | Python, Django, Django REST Framework |
| Blockchain integration | Web3.py |
| Frontend | React, Vite, JavaScript |
| Cryptographic hashing | SHA-256 |
| Smart contract testing | Hardhat, Mocha, Chai |

## Architecture

```text
User
 |
 v
React + Vite Frontend
 |
 | HTTP requests
 v
Django REST API
 |
 | Web3.py
 v
Hardhat Local Blockchain
 |
 v
DocumentRegistry.sol
```

## How It Works

1. The user selects a document.
2. The Django backend calculates its SHA-256 hash.
3. During registration, the backend submits the hash to the smart contract.
4. The contract records the hash, registering address, and timestamp.
5. During verification, the backend calculates the uploaded file's hash again.
6. The smart contract is queried to determine whether that hash has been registered.

Changing a file's contents produces a different SHA-256 hash, so a modified file will not match the original registration.

## Project Structure

```text
DocuProof/
├── contracts/
│   └── DocumentRegistry.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── DocumentRegistry.js
├── backend/
│   ├── config/
│   ├── documents/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── sample_files/
├── hardhat.config.js
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

- Node.js and npm
- Python 3.12 or a compatible Python version
- Git

## Run Locally

### 1. Install blockchain dependencies

From the project root:

```bash
npm install
```

### 2. Compile and test the smart contract

```bash
npx hardhat compile
npx hardhat test
```

### 3. Start the local blockchain

In a dedicated terminal at the project root:

```bash
npx hardhat node
```

Keep this terminal running.

### 4. Deploy the smart contract

In another terminal at the project root:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address for the backend configuration.

### 5. Configure the Django backend

Open a terminal:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a local `backend/.env` file with:

```text
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

Replace the placeholder with the address printed by the deployment script.

Return to the project root in another terminal and compile the contract first if needed, so the backend can access its ABI under `artifacts/`.

Start Django:

```bash
cd backend
source .venv/bin/activate
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### 6. Start the React frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/documents/register/` | Register an uploaded document |
| POST | `/api/documents/verify/` | Verify an uploaded document |
| GET | `/api/documents/<hash>/` | Retrieve registration information by hash |

For POST requests, upload the document using the multipart form field named `file`.

## Security and Limitations

- This is a local development prototype, not a production-ready service.
- The current registration flow uses an unlocked Hardhat development account.
- The API currently lacks production-grade authentication and authorization.
- Local blockchain state can be lost when the development node is restarted.
- The application verifies hash registration; it does not establish whether a document's contents are legally valid or factually correct.
- Uploaded files are hashed by the backend and should not be treated as confidential merely because their hashes are recorded on-chain.
- Never commit `.env` files, private keys, wallet recovery phrases, or production secrets.

## Future Improvements

- MetaMask wallet integration and user-authorized transactions.
- Authentication, authorization, and rate limiting.
- Deployment to a public blockchain testnet.
- Better API error handling and comprehensive integration tests.
- Continuous integration and deployment.
- Publicly accessible demonstration.

## Author

**Soha Ansari**

B.Tech Computer Science and Engineering (AI & ML)

Finolex Academy of Management and Technology
