import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  query,
  where,
  getDocs,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";

export default function CreateRequestOrTrip() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState("request");

  const [requestData, setRequestData] = useState({
    baslik: "",
    aciklama: "",
    ulke: "",
    butce: "",
  });

  const [tripData, setTripData] = useState({
    kalkis: "",
    varis: "",
    tarih: "",
    not: "",
  });

  useEffect(() => {
    if (!loading && (!user || !user.emailVerified)) {
      router.push("/en/profil");
    }
  }, [loading, user, router]);

  if (user && !user.emailVerified) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Email Verification Required
          </h2>
          <p>
            Please verify the email address associated with your account.
            You will be able to access this page after verification.
          </p>
        </div>
      </main>
    );
  }

  const handleChange = (e, setStateFunc) => {
    setStateFunc((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    try {
      const requestQuery = query(
        collection(db, "talepler"),
        where("kullaniciId", "==", user.uid)
      );

      const requestSnapshot = await getDocs(requestQuery);

      if (!requestSnapshot.empty) {
        alert(
          "You can create only one request. Please upgrade to a premium membership to create more."
        );
        return;
      }

      await addDoc(collection(db, "talepler"), {
        ...requestData,
        kullaniciId: user.uid,
        kullaniciEmail: user.email,
        tarih: serverTimestamp(),
      });

      router.push("/en/talepler");
    } catch (err) {
      alert("Request could not be created: " + err.message);
    }
  };

  const handleTripSubmit = async (e) => {
    e.preventDefault();

    try {
      const tripQuery = query(
        collection(db, "yolculuklar"),
        where("kullaniciId", "==", user.uid)
      );

      const tripSnapshot = await getDocs(tripQuery);

      if (!tripSnapshot.empty) {
        alert(
          "You can create only one trip. Please upgrade to a premium membership to create more."
        );
        return;
      }

      await addDoc(collection(db, "yolculuklar"), {
        ...tripData,
        kullaniciId: user.uid,
        kullaniciEmail: user.email,
        tarihOlusturma: serverTimestamp(),
      });

      router.push("/en/talepler?sekme=yolculuklar");
    } catch (err) {
      alert("Trip could not be created: " + err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <Head>
        <title>Create Request / Trip | Travel Together</title>
        <meta
          name="description"
          content="Create an item request or publish your upcoming trip."
        />
      </Head>

      <main className="bg-white min-h-screen text-gray-800">
        <section className="py-12 px-4 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Create New {activeTab === "request" ? "Request" : "Trip"}
          </h1>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("request")}
              className={`px-4 py-2 rounded-full ${
                activeTab === "request"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Create Request
            </button>

            <button
              onClick={() => setActiveTab("trip")}
              className={`px-4 py-2 rounded-full ${
                activeTab === "trip"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Create Trip
            </button>
          </div>

          {activeTab === "request" ? (
            <form onSubmit={handleRequestSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 font-semibold">
                  Product Name
                </label>
                <input
                  name="baslik"
                  type="text"
                  onChange={(e) => handleChange(e, setRequestData)}
                  className="w-full border px-4 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Description
                </label>
                <textarea
                  name="aciklama"
                  onChange={(e) => handleChange(e, setRequestData)}
                  className="w-full border px-4 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Country
                </label>
                <input
                  name="ulke"
                  type="text"
                  onChange={(e) => handleChange(e, setRequestData)}
                  className="w-full border px-4 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Budget (₺)
                </label>
                <input
                  name="butce"
                  type="number"
                  onChange={(e) => handleChange(e, setRequestData)}
                  className="w-full border px-4 py-2 rounded"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-full w-full hover:bg-blue-700"
              >
                Create Request
              </button>
            </form>
          ) : (
            <form onSubmit={handleTripSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 font-semibold">
                  Departure Country / City
                </label>
                <input
                  name="kalkis"
                  type="text"
                  onChange={(e) => handleChange(e, setTripData)}
                  className="w-full border px-4 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Destination Country / City
                </label>
                <input
                  name="varis"
                  type="text"
                  onChange={(e) => handleChange(e, setTripData)}
                  className="w-full border px-4 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Travel Date
                </label>
                <input
                  name="tarih"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleChange(e, setTripData)}
                  className="w-full border px-4 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Note (Optional)
                </label>
                <textarea
                  name="not"
                  onChange={(e) => handleChange(e, setTripData)}
                  className="w-full border px-4 py-2 rounded"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-full w-full hover:bg-blue-700"
              >
                Create Trip
              </button>
            </form>
          )}
        </section>
      </main>
    </>
  );
}
