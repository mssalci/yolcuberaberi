import { useState } from "react";
import Taleplerim from "./taleplerim";
import Tekliflerim from "./tekliflerim";

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState("myRequests");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">
        My Matches
      </h1>

      <div className="flex space-x-4 border-b pb-2 mb-4">
        <button
          onClick={() => setActiveTab("myRequests")}
          className={`px-4 py-2 border-b-2 ${
            activeTab === "myRequests"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-600"
          }`}
        >
          My Requests
        </button>

        <button
          onClick={() => setActiveTab("myOffers")}
          className={`px-4 py-2 border-b-2 ${
            activeTab === "myOffers"
              ? "border-green-600 text-green-600 font-semibold"
              : "border-transparent text-gray-600"
          }`}
        >
          My Offers
        </button>
      </div>

      {activeTab === "myRequests" && <Taleplerim />}
      {activeTab === "myOffers" && <Tekliflerim />}
    </div>
  );
}
