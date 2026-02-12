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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    type: "Flood" as DisasterType,
    state: "",
    district: "",
    area: "",
    date: new Date().toISOString().split("T")[0],
    population: 0,
    infrastructure: "",
    details: {
      floodDays: 0,
      floodStartDate: "",
    } as Record<string, any>,
    evidenceUrls: {
      news: "",
      video: ""
    },
    userWallet: ""
  });

  // IMAGE UPLOAD
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files as FileList).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imagePreviews.length < 3) {
      alert("Please upload at least 3 images for accurate damage identification.");
      return;
    }

    try {
      setLoading(true);
      setAiAnalyzing(true);

      const aiResult: AIResult = await analyzeDisasterImage(
        imagePreviews[0], // Use first image for initial ML score
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
        images: imagePreviews,
        severityAI: aiResult.severity_final,
        status: "Pending",
        fundStatus: "Pending",
        timestamp: new Date().toISOString(),
        details: formData.details,
        evidenceUrls: formData.evidenceUrls,
        userWallet: formData.userWallet,
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
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Disaster Type
            </label>
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
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">State</label>
            <input
              className="w-full border rounded-lg px-4 py-2"
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">District</label>
            <input
              className="w-full border rounded-lg px-4 py-2"
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Area / Locality
            </label>
            <input
              className="w-full border rounded-lg px-4 py-2"
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value })
              }
            />
          </div>

          {/* Flood Start Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Flood Start Date
            </label>
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
          </div>

          {/* Impact */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Affected Population
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-4 py-2"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  population: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Number of Flood Days
            </label>
            <input
              type="number"
              min={0}
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
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Infrastructure Damage
            </label>
            <input
              className="w-full border rounded-lg px-4 py-2"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  infrastructure: e.target.value,
                })
              }
            />
          </div>

          {/* Additional Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">News Report Link (Optional)</label>
              <input
                className="w-full border rounded-lg px-4 py-2"
                placeholder="https://..."
                value={formData.evidenceUrls.news}
                onChange={(e) => setFormData({
                  ...formData,
                  evidenceUrls: { ...formData.evidenceUrls, news: e.target.value }
                })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Video Evidence Link (Optional)</label>
              <input
                className="w-full border rounded-lg px-4 py-2"
                placeholder="https://youtube.com/..."
                value={formData.evidenceUrls.video}
                onChange={(e) => setFormData({
                  ...formData,
                  evidenceUrls: { ...formData.evidenceUrls, video: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Upload Disaster Evidence (Min 3 Images Required)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer text-teal-600 font-bold hover:underline">
                Click to upload images
              </label>
              <p className="text-xs text-slate-400 mt-1">Found {imagePreviews.length} images</p>
            </div>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {imagePreviews.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    className="h-24 w-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Wallet Address for Funds */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Payout Wallet Address (Required for Aid)
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-4 py-2 font-mono text-xs"
                placeholder="0x..."
                required
                value={formData.userWallet}
                onChange={(e) =>
                  setFormData({ ...formData, userWallet: e.target.value })
                }
              />
              <button
                type="button"
                onClick={async () => {
                  if ((window as any).ethereum) {
                    const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                    setFormData({ ...formData, userWallet: accounts[0] });
                  } else {
                    alert("Please install MetaMask");
                  }
                }}
                className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
              >
                Get My Wallet
              </button>
            </div>
          </div>

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
