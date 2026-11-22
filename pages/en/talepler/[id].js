
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

export default function RequestDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [request, setRequest] = useState(null);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [user, setUser] = useState(null);
  const [requestOwnerName, setRequestOwnerName] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const docRef = doc(db, "talepler", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const requestData = { id: docSnap.id, ...docSnap.data() };
          setRequest(requestData);

          const userRef = doc(db, "kullanicilar", requestData.kullaniciId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setRequestOwnerName(
              userSnap.data().adSoyad || "Unknown"
            );
          }
        }
      } catch (error) {
        console.error("Error fetching request:", error);
      }
    };

    const fetchMatches = async () => {
      if (!id) return;

      try {
        const q = query(
          collection(db, "eslesmeler"),
          where("talepId", "==", id)
        );

        const querySnapshot = await getDocs(q);
        const data = [];

        for (let docSnap of querySnapshot.docs) {
          const offerDoc = await getDoc(
            doc(db, "teklifler", docSnap.data().teklifId)
          );

          data.push({
            id: docSnap.id,
            ...docSnap.data(),
            offer: offerDoc.exists() ? offerDoc.data() : null,
          });
        }

        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    if (id) {
      fetchRequest();
      fetchMatches();
    }
  }, [id]);

  const handleSubmitOffer = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must log in to submit an offer.");
      return;
    }

    if (!user.emailVerified) {
      alert("You must verify your email address before submitting an offer.");
      return;
    }

    if (!price || !request) return;

    if (new Date(date) < new Date(todayStr)) {
      alert("The delivery date cannot be earlier than today.");
      return;
    }

    try {
      setLoading(true);

      // Check whether the user has already submitted an offer
      const q = query(
        collection(db, "teklifler"),
        where("teklifVerenId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert(
          "You have already submitted an offer for another request or trip. You cannot submit another offer."
        );
        setLoading(false);
        return;
      }

      // Check whether the user has already submitted an offer for this request
      const existingOffer = matches.some(
        (match) => match.teklifVerenId === user.uid
      );

      if (existingOffer) {
        alert("You have already submitted an offer for this request.");
        setLoading(false);
        return;
      }

      // Create the offer
      const offerRef = await addDoc(collection(db, "teklifler"), {
        talepId: request.id,
        teklifVerenId: user.uid,
        fiyat: parseFloat(price),
        not: note,
        tarih: date,
        olusturmaZamani: serverTimestamp(),
      });

      await addDoc(collection(db, "eslesmeler"), {
        talepId: request.id,
        teklifId: offerRef.id,
        teklifVerenId: user.uid,
        talepSahibiId: request.kullaniciId || null,
        olusturmaZamani: serverTimestamp(),
      });

      alert("Your offer and match have been created successfully.");

      setPrice("");
      setNote("");
      setDate("");
      router.reload();
    } catch (error) {
      console.error("Offer/match error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete this request?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "talepler", request.id));
      alert("Request deleted successfully.");
      router.push("/en/talepler");
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("The request could not be deleted.");
    }
  };

  const isRequestOwner =
    user && request?.kullaniciId === user.uid;

  if (!request) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">
        {request.baslik}
      </h1>

      <p className="text-gray-700 mb-2">
        {request.aciklama}
      </p>

      <p className="text-gray-600 text-sm mb-1">
        Country/City: {request.ulke || "-"}
      </p>

      <p className="text-gray-600 text-sm mb-1">
        Date:{" "}
        {request.tarih?.toDate?.().toLocaleDateString("en-GB") || "-"}
      </p>

      <p className="text-gray-600 text-sm mb-1">
        Budget: {request.butce || "-"}
      </p>

      <p className="text-gray-600 text-sm mb-6">
        Request Owner: {requestOwnerName || "-"}
      </p>

      {isRequestOwner && (
        <button
          onClick={handleDeleteRequest}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Request
        </button>
      )}

      {user && !isRequestOwner && (
        <form
          onSubmit={handleSubmitOffer}
          className="space-y-4 bg-gray-100 p-4 rounded mb-8"
        >
          <div>
            <label className="block text-sm font-medium">
              Price (₺)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Delivery Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayStr}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Submit Offer"}
          </button>
        </form>
      )}

      {matches.length > 0 && isRequestOwner && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Offers Received
          </h2>

          <ul className="space-y-3">
            {matches.map((match) => (
              <li
                key={match.id}
                className="p-3 bg-white rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    Price: ₺{match.offer?.fiyat}
                  </p>

                  <p className="text-sm text-gray-600">
                    Delivery Date: {match.offer?.tarih || "-"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Note: {match.offer?.not || "-"}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/en/chat/${match.id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Open Chat
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
