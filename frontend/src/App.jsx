import { useState } from "react";
import "./App.css";

const API_BASE = "/api/documents";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeAction, setActiveAction] = useState("");

  async function handleDocumentAction(action) {
    if (!file) {
      setResult({
        type: "error",
        message: "Please select a document first.",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setActiveAction(action);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/${action}/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult({
        type: action === "register" || data.is_registered ? "success" : "warning",
        data,
        message:
          data.message ||
          (data.is_registered
            ? "Document verified successfully."
            : "Document was not found on the blockchain."),
      });
    } catch (error) {
      setResult({
        type: "error",
        message:
          error.message ||
          "Unable to connect to the server. Check that Django is running.",
      });
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  }

  function formatTimestamp(timestamp) {
    if (!timestamp || Number(timestamp) === 0) return "Not registered";
    return new Date(Number(timestamp) * 1000).toLocaleString();
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <a className="brand" href="/" aria-label="DocuProof home">
          <span className="brand-icon">D</span>
          <span>DocuProof</span>
        </a>
        <span className="network-status">
          <span className="status-dot" />
          Local blockchain
        </span>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            BLOCKCHAIN DOCUMENT SECURITY
          </div>

          <h1>
            Trust your documents.
            <br />
            <span>Verify every detail.</span>
          </h1>

          <p className="hero-description">
            Register documents on the blockchain and verify their authenticity
            using a unique cryptographic fingerprint. Your files stay on your
            device and are not stored on the blockchain.
          </p>
        </section>

        <section className="workspace">
          <div className="upload-card">
            <div className="card-heading">
              <div>
                <span className="step-label">STEP 01</span>
                <h2>Select a document</h2>
              </div>
              <span className="file-icon">↥</span>
            </div>

            <label className="drop-zone">
              <input
                type="file"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setResult(null);
                }}
              />
              <span className="upload-symbol">↑</span>
              <strong>{file ? file.name : "Choose a file to get started"}</strong>
              <span className="drop-hint">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB · Ready to process`
                  : "Click here to browse your files · Max 10 MB"}
              </span>
            </label>

            <div className="action-buttons">
              <button
                className="button button-primary"
                onClick={() => handleDocumentAction("register")}
                disabled={loading}
              >
                {loading && activeAction === "register"
                  ? "Registering..."
                  : "Register document"}
                <span>↗</span>
              </button>

              <button
                className="button button-secondary"
                onClick={() => handleDocumentAction("verify")}
                disabled={loading}
              >
                {loading && activeAction === "verify"
                  ? "Verifying..."
                  : "Verify document"}
              </button>
            </div>

            <p className="privacy-note">
              <span>◆</span> Only the file's SHA-256 hash is recorded on-chain.
            </p>
          </div>

          <aside className="info-card">
            <span className="step-label">HOW IT WORKS</span>
            <h2>Three steps. Verifiable proof.</h2>

            <div className="process-step">
              <span className="process-number">01</span>
              <div>
                <h3>Choose your file</h3>
                <p>Select a document from your device.</p>
              </div>
            </div>

            <div className="process-step">
              <span className="process-number">02</span>
              <div>
                <h3>Create its fingerprint</h3>
                <p>SHA-256 produces a unique hash from the file contents.</p>
              </div>
            </div>

            <div className="process-step">
              <span className="process-number">03</span>
              <div>
                <h3>Verify on-chain</h3>
                <p>Check the hash against the blockchain registry.</p>
              </div>
            </div>

            <div className="security-note">
              <span className="security-symbol">✓</span>
              <p>
                Changing even one byte changes the hash, so an edited file
                won't match the original registration.
              </p>
            </div>
          </aside>
        </section>

        {result && (
          <section
            className={`result-card result-${result.type}`}
            aria-live="polite"
          >
            <div className="result-heading">
              <div>
                <span className="step-label">RESULT</span>
                <h2>
                  {result.type === "success"
                    ? "Operation successful"
                    : result.type === "warning"
                      ? "Document not found"
                      : "Unable to complete"}
                </h2>
              </div>
              <span className="result-mark">
                {result.type === "success"
                  ? "✓"
                  : result.type === "warning"
                    ? "!"
                    : "×"}
              </span>
            </div>

            <p className="result-message">{result.message}</p>

            {result.data && (
              <div className="result-details">
                <div className="detail-row">
                  <span>Registration status</span>
                  <strong>
                    {result.data.is_registered === undefined
                      ? "Registered"
                      : result.data.is_registered
                        ? "Verified on-chain"
                        : "Not registered"}
                  </strong>
                </div>

                <div className="detail-row detail-column">
                  <span>Document SHA-256 hash</span>
                  <code>{result.data.document_hash}</code>
                </div>

                {result.data.owner && (
                  <div className="detail-row detail-column">
                    <span>Owner address</span>
                    <code>{result.data.owner}</code>
                  </div>
                )}

                {result.data.registered_at !== undefined && (
                  <div className="detail-row">
                    <span>Registered at</span>
                    <strong>
                      {formatTimestamp(result.data.registered_at)}
                    </strong>
                  </div>
                )}

                {result.data.transaction_hash && (
                  <div className="detail-row detail-column">
                    <span>Transaction hash</span>
                    <code>{result.data.transaction_hash}</code>
                  </div>
                )}

                {result.data.block_number !== undefined && (
                  <div className="detail-row">
                    <span>Block number</span>
                    <strong>{result.data.block_number}</strong>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <section className="bottom-note">
          <span className="bottom-note-icon">i</span>
          <p>
            <strong>Development prototype:</strong> This version uses a local
            Hardhat blockchain. Its verification proves that the exact file
            hash is registered, not that the document's contents are legally
            valid or factually correct.
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>DocuProof</span>
        <span>Built with React · Django REST · Solidity</span>
      </footer>
    </div>
  );
}

export default App;
