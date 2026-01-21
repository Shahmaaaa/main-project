import { useState, ChangeEvent } from "react";
import { analyzeDisasterImage, AIResult } from "../services/aiService";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const AIAnalyzer = () => {
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setLoading(true);
    try {
      const base64 = await toBase64(e.target.files[0]);
     const res = await analyzeDisasterImage(base64, 0, 0);

      setResult(res);
    } catch (err) {
      console.error("AI analysis failed:", err);
      alert("AI analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Flood Damage AI Analysis</h2>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {loading && <p>Analyzing image...</p>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Severity: {result.severity}</h3>
          <p>Confidence: {Math.round(result.confidence * 100)}%</p>
          <p>{result.reasoning}</p>
        </div>
      )}
    </div>
  );
};

export default AIAnalyzer;
