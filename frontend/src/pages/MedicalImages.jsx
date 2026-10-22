
import { useEffect, useRef, useState } from "react";
import { API_URL, getAuthToken, getPatientId } from "../api";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const css = `
.med-page {
  color: var(--text-primary, #14233f);
  width: 100%;
  min-width: 0;
  padding: 4px 0 24px;
}
.med-page * { box-sizing: border-box; }
.med-muted { color: var(--text-secondary, #64748b); }
.med-hero {
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; padding: 27px 30px; margin: 18px 0;
  border: 1px solid #d9e7ff; border-radius: 18px;
  background: linear-gradient(115deg, #edf4ff 0%, #f8fbff 75%, #e5efff 100%);
}
.med-hero h2 { font-size: clamp(23px, 3vw, 30px); margin: 0 0 9px; }
.med-hero p { margin: 0; color: #526783; line-height: 1.7; }
.med-hero-icon {
  flex: 0 0 76px; width: 76px; height: 76px;
  display: grid; place-items: center; border-radius: 20px;
  background: white; color: #2563eb; font-size: 36px;
  box-shadow: 0 5px 18px #1d4ed810;
}
.med-grid {
  display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr);
  gap: 18px; margin-bottom: 18px;
}
.med-card {
  min-width: 0; padding: 23px;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 17px;
  box-shadow: 0 4px 15px rgba(15, 23, 42, .025);
}
.med-card-heading {
  display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
}
.med-card-heading h3 { margin: 0; font-size: 19px; }
.med-icon {
  display: grid; place-items: center; flex: 0 0 42px;
  width: 42px; height: 42px; border-radius: 12px;
  background: #edf4ff; color: #2563eb; font-size: 22px;
}
.med-help { font-size: 14px; line-height: 1.7; margin: 8px 0 18px; }
.med-drop {
  border: 1.5px dashed #a7c5ff; background: #f8fbff;
  border-radius: 13px; padding: 23px 15px; text-align: center;
  transition: background .2s, border-color .2s;
}
.med-drop.dragging { background: #eaf2ff; border-color: #2563eb; }
.med-cloud { font-size: 34px; color: #3478f6; margin-bottom: 7px; }
.med-primary, .med-secondary {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; border-radius: 9px; padding: 11px 16px;
  font: inherit; font-size: 14px; font-weight: 650;
  cursor: pointer; transition: .18s; border: 1px solid transparent;
}
.med-primary { color: #fff; background: #2563eb; }
.med-primary:hover:not(:disabled) { background: #1d4ed8; }
.med-secondary {
  color: #24436f; background: #f1f5f9; border-color: #e2e8f0;
}
.med-primary:disabled, .med-secondary:disabled {
  opacity: .55; cursor: not-allowed;
}
.med-full { width: 100%; margin-top: 14px; }
.med-preview {
  display: flex; gap: 13px; align-items: center; margin-top: 15px;
  padding: 11px; background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 11px; min-width: 0;
}
.med-preview img {
  width: 76px; height: 76px; object-fit: contain;
  background: #e2e8f0; border-radius: 8px;
}
.med-file-info { min-width: 0; flex: 1; }
.med-file-name { overflow-wrap: anywhere; font-size: 13px; font-weight: 600; }
.med-remove {
  border: 0; background: transparent; color: #dc2626;
  cursor: pointer; padding: 8px; font-size: 13px;
}
.med-guidelines { display: grid; gap: 17px; margin-top: 18px; }
.med-guide { display: flex; gap: 12px; align-items: flex-start; }
.med-guide-icon {
  flex: 0 0 39px; width: 39px; height: 39px;
  display: grid; place-items: center; border-radius: 11px;
  background: #eff6ff; color: #2563eb; font-size: 19px;
}
.med-guide strong { display: block; font-size: 14px; margin: 1px 0 4px; }
.med-guide span { display: block; color: #64748b; font-size: 13px; line-height: 1.55; }
.med-alert {
  padding: 12px 14px; border-radius: 10px; margin-top: 14px;
  font-size: 13px; line-height: 1.6; overflow-wrap: anywhere;
}
.med-alert.success { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.med-alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.med-history-head {
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px; flex-wrap: wrap; margin-bottom: 18px;
}
.med-history-head h3 { margin: 0 0 6px; font-size: 19px; }
.med-history-head p { margin: 0; font-size: 13px; }
.med-table-wrap { overflow-x: auto; width: 100%; }
.med-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
.med-table th {
  padding: 13px 12px; background: #f4f7fb; color: #475569;
  font-weight: 650; white-space: nowrap;
}
.med-table th:first-child { border-radius: 8px 0 0 8px; }
.med-table th:last-child { border-radius: 0 8px 8px 0; }
.med-table td { padding: 15px 12px; border-bottom: 1px solid #edf0f5; }
.med-table tbody tr:last-child td { border-bottom: 0; }
.med-table tbody tr:hover { background: #fafcff; }
.med-thumb {
  width: 64px; height: 56px; border-radius: 9px;
  display: grid; place-items: center; overflow: hidden;
  background: #edf4ff; color: #2563eb; font-size: 22px;
}
.med-thumb img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.med-status {
  display: inline-block; padding: 5px 9px; border-radius: 20px;
  background: #eef2f7; color: #475569; font-size: 11px;
  font-weight: 650; white-space: nowrap;
}
.med-filename { min-width: 155px; max-width: 290px; overflow-wrap: anywhere; }
.med-empty { padding: 32px 12px; text-align: center; color: #64748b; }
.med-empty-icon { font-size: 30px; margin-bottom: 8px; }
.med-footnote {
  color: #64748b; font-size: 12px; line-height: 1.7;
  display: flex; align-items: flex-start; gap: 9px; margin-top: 18px;
}
.med-footnote-icon { color: #2563eb; font-size: 17px; }
.med-hidden-input {
  position: absolute; width: 1px; height: 1px; padding: 0;
  margin: -1px; overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}

.med-actions { display: flex; flex-wrap: wrap; gap: 7px; min-width: 190px; }
.med-action-btn {
  border: 1px solid #dbe5f3; border-radius: 8px; padding: 7px 10px;
  background: #fff; color: #24436f; font: inherit; font-size: 12px;
  font-weight: 650; cursor: pointer;
}
.med-action-btn.primary { color: #fff; background: #2563eb; border-color: #2563eb; }
.med-action-btn:disabled { opacity: .55; cursor: not-allowed; }
.med-analysis { margin-top: 18px; border: 1px solid #d9e7ff; border-radius: 14px; padding: 20px; background: #fbfdff; }
.med-analysis-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.med-analysis-title h3 { font-size: 19px; margin: 0 0 5px; }
.med-score-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px 22px; margin-top: 18px; }
.med-score-row { min-width: 0; }
.med-score-label { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; margin-bottom: 6px; }
.med-score-track { height: 8px; border-radius: 20px; overflow: hidden; background: #e8eef7; }
.med-score-fill { height: 100%; border-radius: inherit; background: #3b82f6; }
.med-analysis-warning { margin-top: 17px; padding: 12px 14px; border-radius: 10px; background: #fff7e8; border: 1px solid #f5d59a; color: #854d0e; font-size: 13px; line-height: 1.65; }
.med-analysis-meta { display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 12px; color: #64748b; margin-top: 8px; }
@media (max-width: 900px) {
  .med-grid { grid-template-columns: 1fr; }
}
@media (max-width: 540px) {
  .med-hero { padding: 20px; gap: 12px; }
  .med-hero-icon { flex-basis: 53px; width: 53px; height: 53px; font-size: 27px; }
  .med-card { padding: 16px; }
  .med-history-head { align-items: flex-start; }
}
`;

export default function MedicalImages() {
  const patientId = getPatientId();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [analysisLoadingId, setAnalysisLoadingId] = useState(null);
  const [historyLoadingId, setHistoryLoadingId] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedAnalysisImage, setSelectedAnalysisImage] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisMessage, setAnalysisMessage] = useState("");

  async function loadHistory() {
    if (!patientId || !getAuthToken()) {
      setError("Patient information or login token is missing. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/medical-images/${encodeURIComponent(patientId)}/history`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load image history.");
      }

      setImages(data.images || []);
      setError("");
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Load authenticated thumbnails whenever the image history changes.
  useEffect(() => {
    if (!images.length || !patientId || !getAuthToken()) {
      setThumbnails({});
      return undefined;
    }

    const controller = new AbortController();
    const objectUrls = [];

    async function fetchThumbnails() {
      const token = getAuthToken();

      const results = await Promise.all(
        images.map(async (image) => {
          try {
            const response = await fetch(
              `${API_URL}/medical-images/${encodeURIComponent(patientId)}/${image.image_id}/content`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
              }
            );

            if (!response.ok) {
              throw new Error(`Image request failed (${response.status})`);
            }

            const blob = await response.blob();

            if (!blob.type.startsWith("image/")) {
              throw new Error("Server did not return an image.");
            }

            const objectUrl = URL.createObjectURL(blob);
            objectUrls.push(objectUrl);

            return [image.image_id, objectUrl];
          } catch (err) {
            if (err.name !== "AbortError") {
              console.error(
                `Could not load thumbnail for image ${image.image_id}:`,
                err.message
              );
            }
            return [image.image_id, null];
          }
        })
      );

      if (!controller.signal.aborted) {
        setThumbnails(Object.fromEntries(results));
      } else {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    }

    fetchThumbnails();

    return () => {
      controller.abort();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images, patientId]);

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  // Preview for the file currently selected for upload.
  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function acceptFile(selected) {
    setMessage("");
    setError("");

    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Please choose a JPEG or PNG image.");
      return;
    }

    if (selected.size > MAX_SIZE) {
      setError("The image must be 10 MB or smaller.");
      return;
    }

    setFile(selected);
  }

  function handleFileChange(event) {
    acceptFile(event.target.files?.[0]);
    event.target.value = "";
  }

  async function handleUpload(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!patientId || !getAuthToken()) {
      setError("Please log in again to upload an image.");
      return;
    }

    if (!file) {
      setError("Please select a JPEG or PNG image first.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/medical-images/upload/${encodeURIComponent(patientId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Image upload failed.");
      }

      setMessage(`Image uploaded successfully. Image ID: ${data.image_id}`);
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadHistory();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function analyzeImage(imageId) {
    setAnalysisError("");
    setAnalysisMessage("");
    setAnalysisHistory([]);
    setSelectedAnalysisImage(imageId);
    setAnalysisLoadingId(imageId);

    try {
      const response = await fetch(
        `${API_URL}/medical-images/${encodeURIComponent(patientId)}/${imageId}/analyze`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "AI analysis failed.");
      }

      setAnalysisHistory([data]);
      setAnalysisMessage(`Analysis completed and saved. Analysis ID: ${data.analysis_id}`);
      await loadHistory();
    } catch (err) {
      setAnalysisError(err.message || "Could not run AI analysis.");
    } finally {
      setAnalysisLoadingId(null);
    }
  }

  async function loadAnalysisHistory(imageId) {
    setAnalysisError("");
    setAnalysisMessage("");
    setAnalysisHistory([]);
    setSelectedAnalysisImage(imageId);
    setHistoryLoadingId(imageId);

    try {
      const response = await fetch(
        `${API_URL}/medical-images/${encodeURIComponent(patientId)}/${imageId}/analyses`,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Could not load analysis history.");
      }
      setAnalysisHistory(data.analyses || []);
      if (!data.analyses?.length) {
        setAnalysisMessage("No saved AI analyses exist for this image yet.");
      }
    } catch (err) {
      setAnalysisError(err.message || "Could not load analysis history.");
    } finally {
      setHistoryLoadingId(null);
    }
  }

  return (
    <section className="med-page">
      <style>{css}</style>

      <p className="med-muted" style={{ margin: "0 0 4px", fontSize: 13 }}>
        Healthcare workspace / Medical Images
      </p>

      <div className="med-hero">
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div className="med-hero-icon" aria-hidden="true">▧</div>
          <div>
            <h2>Medical Images</h2>
            <p>
              Upload and manage medical-image records
              <br /> associated with your Digital Twin.
            </p>
          </div>
        </div>

        <div className="med-muted" style={{ fontSize: 12, lineHeight: 1.8 }}>
          <strong style={{ color: "#2563eb" }}>CHEST X-RAY</strong>
          <div>✓ JPEG and PNG</div>
          <div>✓ Up to 10 MB</div>
          <div>✓ Authenticated access</div>
        </div>
      </div>

      <div className="med-grid">
        <div className="med-card">
          <div className="med-card-heading">
            <div className="med-icon" aria-hidden="true">↑</div>
            <h3>Upload a Chest X-ray</h3>
          </div>

          <p className="med-help med-muted">
            Select a medical image from your device. Supported formats:
            JPEG and PNG. Maximum size: 10 MB.
          </p>

          <form onSubmit={handleUpload}>
            <div
              className={`med-drop ${dragging ? "dragging" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                acceptFile(event.dataTransfer.files?.[0]);
              }}
            >
              <div className="med-cloud" aria-hidden="true">☁↑</div>
              <strong style={{ display: "block", fontSize: 14 }}>
                Drag and drop an image here
              </strong>
              <p
                className="med-muted"
                style={{ margin: "7px 0 15px", fontSize: 13 }}
              >
                or choose a file from your device
              </p>

              <input
                ref={fileInputRef}
                id="medical-image-file"
                className="med-hidden-input"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
              />

              <button
                className="med-primary"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                ▧ &nbsp; Choose Image
              </button>
            </div>

            {preview && file && (
              <div className="med-preview">
                <img src={preview} alt="Selected medical image preview" />
                <div className="med-file-info">
                  <div className="med-file-name">{file.name}</div>
                  <div
                    className="med-muted"
                    style={{ fontSize: 12, marginTop: 5 }}
                  >
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                  </div>
                </div>
                <button
                  type="button"
                  className="med-remove"
                  onClick={() => setFile(null)}
                  aria-label="Remove selected image"
                >
                  Remove
                </button>
              </div>
            )}

            <button
              type="submit"
              className="med-primary med-full"
              disabled={uploading || !file}
            >
              {uploading ? "Uploading image…" : "↑  Upload Image"}
            </button>
          </form>

          {message && (
            <div className="med-alert success" role="status">
              ✓ &nbsp; {message}
            </div>
          )}

          {error && (
            <div className="med-alert error" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="med-card">
          <div className="med-card-heading">
            <div className="med-icon" aria-hidden="true">ⓘ</div>
            <h3>Upload Guidelines</h3>
          </div>

          <div className="med-guidelines">
            <div className="med-guide">
              <div className="med-guide-icon">▤</div>
              <div>
                <strong>Supported formats</strong>
                <span>JPEG and PNG images</span>
              </div>
            </div>

            <div className="med-guide">
              <div className="med-guide-icon">▣</div>
              <div>
                <strong>Maximum file size</strong>
                <span>10 MB per image</span>
              </div>
            </div>

            <div className="med-guide">
              <div className="med-guide-icon">♡</div>
              <div>
                <strong>Image selection</strong>
                <span>Upload the image type requested by your healthcare workflow.</span>
              </div>
            </div>

            <div className="med-guide">
              <div className="med-guide-icon">♢</div>
              <div>
                <strong>Secure access</strong>
                <span>Uploads and image previews require an authenticated session.</span>
              </div>
            </div>

            <div className="med-guide">
              <div className="med-guide-icon">!</div>
              <div>
                <strong>Research prototype</strong>
                <span>Uploading an image does not perform AI analysis or provide a medical diagnosis.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="med-card">
        <div className="med-history-head">
          <div>
            <div className="med-card-heading" style={{ marginBottom: 5 }}>
              <div className="med-icon" aria-hidden="true">◷</div>
              <h3>Uploaded Image History</h3>
            </div>
            <p className="med-muted">
              Review the medical-image records associated with your account.
            </p>
          </div>

          <button
            type="button"
            className="med-primary"
            onClick={loadHistory}
            disabled={loading}
          >
            ↻ &nbsp; {loading ? "Refreshing…" : "Refresh History"}
          </button>
        </div>

        {loading ? (
          <div className="med-empty">Loading your image history…</div>
        ) : images.length === 0 ? (
          <div className="med-empty">
            <div className="med-empty-icon">▧</div>
            <strong>No uploaded images yet</strong>
            <p>Choose an image above to add your first record.</p>
          </div>
        ) : (
          <div className="med-table-wrap">
            <table className="med-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Filename</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th>AI Analysis</th>
                </tr>
              </thead>

              <tbody>
                {images.map((image) => (
                  <tr key={image.image_id}>
                    <td>{image.image_id}</td>

                    <td>
                      <div className="med-thumb">
                        {thumbnails[image.image_id] ? (
                          <img
                            src={thumbnails[image.image_id]}
                            alt={`Medical image ${image.image_id}`}
                          />
                        ) : (
                          <span aria-label="Image preview loading">▧</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="med-filename">{image.filename}</div>
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      {image.uploaded_at
                        ? new Date(image.uploaded_at).toLocaleString()
                        : "—"}
                    </td>

                    <td>
                      <span className="med-status">
                        {(image.analysis_status || "not_started").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <div className="med-actions">
                        <button
                          type="button"
                          className="med-action-btn primary"
                          onClick={() => analyzeImage(image.image_id)}
                          disabled={analysisLoadingId !== null || historyLoadingId !== null}
                        >
                          {analysisLoadingId === image.image_id ? "Analyzing…" : "Analyze X-ray"}
                        </button>
                        <button
                          type="button"
                          className="med-action-btn"
                          onClick={() => loadAnalysisHistory(image.image_id)}
                          disabled={analysisLoadingId !== null || historyLoadingId !== null}
                        >
                          {historyLoadingId === image.image_id ? "Loading…" : "View results"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAnalysisImage !== null && (
        <div className="med-card med-analysis" aria-live="polite">
          <div className="med-analysis-title">
            <div>
              <h3>Chest X-ray AI Results</h3>
              <p className="med-muted small">
                Image ID: {selectedAnalysisImage} · Experimental model output
              </p>
            </div>
            <span className="med-status">Research prototype</span>
          </div>

          {analysisLoadingId === selectedAnalysisImage || historyLoadingId === selectedAnalysisImage ? (
            <div className="med-empty" role="status">{analysisLoadingId === selectedAnalysisImage ? "Running the AI model…" : "Loading saved analyses…"}</div>
          ) : null}

          {analysisMessage && <div className="med-alert success">{analysisMessage}</div>}
          {analysisError && <div className="med-alert error" role="alert">{analysisError}</div>}

          {analysisHistory.map((analysis) => {
            const scores = Object.entries(analysis.predictions || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
            return (
              <div key={analysis.analysis_id} style={{ marginTop: 16 }}>
                <div className="med-analysis-meta">
                  <span><strong>Analysis:</strong> #{analysis.analysis_id}</span>
                  <span><strong>Model:</strong> {analysis.model}</span>
                  <span><strong>Status:</strong> {analysis.analysis_status || analysis.status || "completed"}</span>
                  {analysis.created_at && <span><strong>Created:</strong> {new Date(analysis.created_at).toLocaleString()}</span>}
                </div>

                {scores.length ? (
                  <>
                    <p className="med-muted small" style={{ marginTop: 18 }}>
                      Model scores (0–1), sorted highest first. These are not confirmed diagnoses or necessarily calibrated probabilities.
                    </p>
                    <div className="med-score-list">
                      {scores.map(([label, score]) => {
                        const numericScore = Number(score);
                        const width = Number.isFinite(numericScore) ? Math.max(0, Math.min(100, numericScore * 100)) : 0;
                        return (
                          <div className="med-score-row" key={label}>
                            <div className="med-score-label">
                              <span>{label.replace(/_/g, " ")}</span>
                              <strong>{Number.isFinite(numericScore) ? numericScore.toFixed(5) : "N/A"}</strong>
                            </div>
                            <div className="med-score-track" aria-label={`${label} model score`}>
                              <div className="med-score-fill" style={{ width: `${width}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="med-muted" style={{ marginTop: 12 }}>No prediction scores were returned for this saved analysis.</p>
                )}

                <div className="med-analysis-warning">
                  <strong>Clinical warning:</strong> {analysis.clinical_warning || "Research output only. Predictions are not confirmed diagnoses and must not be used alone for clinical decisions."}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="med-footnote">
        <span className="med-footnote-icon">ⓘ</span>
        <span>
          <strong>Research prototype:</strong> AI scores are experimental outputs,
          not confirmed diagnoses or necessarily calibrated probabilities. They
          must not be used alone for clinical decisions. Do not upload identifiable
          medical images unless you are authorized to do so.
        </span>
      </div>
    </section>
  );
}
