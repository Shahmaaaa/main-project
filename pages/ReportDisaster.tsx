import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DisasterReport,
  DisasterType,
  User,
} from "../types";
import { analyzeDisasterImage, AIResult } from "../services/aiService";

interface ReportDisasterProps {
  user: User;
  onAddReport: (report: DisasterReport) => void;
}

const ReportDisaster: React.FC<ReportDisasterProps> = ({
  user,
  onAddReport,
}) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
  type: "Flood" as DisasterType,
  state: "",
  district: "",
  area: "",
  date: new Date().toISOString().split("T")[0], // report date
  population: 0,
  infrastructure: "",
  details: {
    floodDays: 0,
    floodStartDate: "", // ✅ ADD THIS
  } as Record<string, any>,
});



  // ---------------- IMAGE UPLOAD ----------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagePreview) {
      alert("Please upload an image.");
      return;
    }

    try {
      setLoading(true);
      setAiAnalyzing(true);

      // ✅ CNN MODEL (Flask backend)
     const aiResult: AIResult = await analyzeDisasterImage(
  imagePreview,
  formData.population,
  formData.details.floodDays
);

const newReport: DisasterReport = {
  id: `REP-${Math.floor(10000 + Math.random() * 90000)}`,
  type: formData.type,
  location: {
    state: formData.state,
    district: formData.district,
    area: formData.area,
  },
  date: formData.date,
  affectedPopulation: formData.population,
  infrastructureDamage: formData.infrastructure,
  images: [imagePreview],
  severityAI: aiResult.severity_final, // ✅ FINAL SEVERITY
  status: "Pending",
  fundStatus: "Pending",
  timestamp: new Date().toISOString(),
  details: formData.details,
  userId: user.id,
  userName: user.name,
};


      onAddReport(newReport);

      setTimeout(() => {
        setAiAnalyzing(false);
        setLoading(false);
        navigate("/my-reports");
      }, 1200);
    } catch (err) {
      console.error(err);
      alert("AI analysis failed");
      setLoading(false);
      setAiAnalyzing(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="bg-slate-900 text-white p-8 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Report Disaster</h2>
          <p className="text-slate-400 mt-2">
            Submit disaster details with image evidence
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Disaster Type */}
          <select
            className="w-full border rounded-lg px-4 py-2"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as DisasterType,
              })
            }
          >
            <option>Flood</option>
            <option>Cyclone</option>
            <option>Earthquake</option>
            <option>Landslide</option>
          </select>

          {/* Location */}
          <input
            placeholder="State"
            className="w-full border rounded-lg px-4 py-2"
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
          />
          <input
            placeholder="District"
            className="w-full border rounded-lg px-4 py-2"
            onChange={(e) =>
              setFormData({ ...formData, district: e.target.value })
            }
          />
          <input
            placeholder="Area"
            className="w-full border rounded-lg px-4 py-2"
            onChange={(e) =>
              setFormData({ ...formData, area: e.target.value })
            }
          />
          <input
  type="date"
  className="w-full border rounded-lg px-4 py-2"
  value={formData.details.floodStartDate || ""}
  onChange={(e) =>
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        floodStartDate: e.target.value,
      },
    })
  }
/>
<label className="text-sm font-medium text-slate-700">
  Flood Start Date
</label>

          {/* Impact */}
          <input
            type="number"
            placeholder="Affected population"
            className="w-full border rounded-lg px-4 py-2"
            onChange={(e) =>
              setFormData({
                ...formData,
                population: Number(e.target.value),
              })
            }
          />
          <input
  type="number"
  min={0}
  placeholder="Number of flood days"
  className="w-full border rounded-lg px-4 py-2"
  value={formData.details.floodDays || ""}
  onChange={(e) =>
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        floodDays: Number(e.target.value),
      },
    })
  }
/>

          <input
            placeholder="Infrastructure damage"
            className="w-full border rounded-lg px-4 py-2"
            onChange={(e) =>
              setFormData({
                ...formData,
                infrastructure: e.target.value,
              })
            }
          />

          {/* Image */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {imagePreview && (
            <img
              src={imagePreview}
              className="max-h-64 rounded-lg mx-auto"
            />
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold"
          >
            {loading ? "Analyzing..." : "Submit Report"}
          </button>
        </form>
      </div>

      {/* AI Overlay */}
      {aiAnalyzing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-10 rounded-xl text-center">
            <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-bold">AI analyzing damage...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDisaster;
