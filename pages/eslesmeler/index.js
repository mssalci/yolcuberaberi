// pages/eslesmeler/index.js
import { useState } from "react";
import Taleplerim from "./taleplerim";
import Tekliflerim from "./tekliflerim";

export default function EslesmelerPage() {
  const [activeTab, setActiveTab] = useState("taleplerim");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Eşleşmeler</h1>

      <div className="flex space-x-4 border-b pb-2 mb-4">
        <button
          onClick={() => setActiveTab("taleplerim")}
          className={`px-4 py-2 border-b-2 ${activeTab === "taleplerim" ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-gray-600"}`}
        >
          Taleplerim
        </button>
        <button
          onClick={() => setActiveTab("tekliflerim")}
          className={`px-4 py-2 border-b-2 ${activeTab === "tekliflerim" ? "border-green-600 text-green-600 font-semibold" : "border-transparent text-gray-600"}`}
        >
          Tekliflerim
        </button>
      </div>

      {activeTab === "taleplerim" && <Taleplerim />}
      {activeTab === "tekliflerim" && <Tekliflerim />}
    </div>
  );
}
