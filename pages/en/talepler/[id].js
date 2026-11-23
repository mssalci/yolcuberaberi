import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

export default function RequestDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [request, setRequest] = useState(null);
  const [requestNotFound, setRequestNotFound] = useState(false);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [requestOwnerName, setRequestOwnerName] = useState("");

  const todayStr = (() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setEmailVerified(currentUser?.emailVerified || false);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchRequest = async () => {
      try {
        const requestRef = doc(db, "talepler", id);
        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) {
          setRequestNotFound(true);
          return;
        }

        const requestData = {
          id: requestSnap.id,
          ...requestSnap.data(),
        };

        setRequest(requestData);

        if (requestData.kullaniciId) {
          const userRef = doc(
            db,
            "kullanicilar",
            requestData.kullaniciId
          );

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
      try {
        const matchesQuery = query(
          collection(db, "eslesmeler"),
          where("talepId", "==", id)
        );

        const snapshot = await getDocs(matchesQuery);
        const data = [];

        for (const matchDoc of snapshot.docs) {
          const matchData = matchDoc.data();

          let offer = null;

          if (matchData.teklifId) {
            const offerSnap = await getDoc(
              doc(db, "teklifler", matchData.teklifId)
            );

            if (offerSnap.exists()) {
              offer = offerSnap.data();
            }
          }

          data.push({
            id: matchDoc.id,
            ...matchData,
            offer,
          });
        }

        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchRequest();
    fetchMatches();
  }, [id]);

  const handleSubmitOffer = async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("You must log in to submit an offer.");
      return;
    }

    try {
      await currentUser.reload();
      await currentUser.getIdToken(true);

      if (!currentUser.emailVerified) {
        setEmailVerified(false);
        alert(
          "You must verify your email address before submitting an offer."
        );
        return;
      }

      setEmailVerified(true);

      if (!request || request.kullaniciId === currentUser.uid) {
        alert("You cannot submit an offer for your own request.");
        return;
      }

      const parsedPrice = Number(price);

      if (!price || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        alert("Please enter a valid price.");
        return;
      }

      if (!date || date < todayStr) {
        alert("The delivery date cannot be earlier than today.");
        return;
      }

      setLoading(true);

      const existingOffersQuery = query(
        collection(db, "teklifler"),
        where("teklifVerenId", "==", currentUser.uid)
      );

      const existingOffersSnapshot = await getDocs(
        existingOffersQuery
      );

      if (!existingOffersSnapshot.empty) {
        alert(
          "You have already submitted an offer for another request or trip. You cannot submit another offer."
        );
        return;
      }

      const existingMatch = matches.some(
        (match) => match.teklifVerenId === currentUser.uid
      );

      if (existingMatch) {
        alert("You have already submitted an offer for this request.");
        return;
      }

      const batch = writeBatch(db);

      const offerRef = doc(collection(db, "teklifler"));
      const matchRef = doc(collection(db, "eslesmeler"));

      batch.set(offerRef, {
        talepId: request.id,
        teklifVerenId: currentUser.uid,
        fiyat: parsedPrice,
        not: note,
        tarih: date,
        olusturmaZamani: serverTimestamp(),
      });

      batch.set(matchRef, {
        talepId: request.id,
        teklifId: offerRef.id,
        teklifVerenId: currentUser.uid,
        talepSahibiId: request.kullaniciId || null,
        olusturmaZamani: serverTimestamp(),
      });

      await batch.commit();

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
    const currentUser = auth.currentUser;

    if (!currentUser || !request) return;

    if (request.kullaniciId !== currentUser.uid) {
      alert("You are not authorized to delete this request.");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to delete this request and all related offers and messages?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const matchesQuery = query(
        collection(db, "eslesmeler"),
        where("talepId", "==", request.id)
      );

      const matchesSnapshot = await getDocs(matchesQuery);

      for (const matchDoc of matchesSnapshot.docs) {
        const messageQuery = query(
          collection(db, "mesajlar"),
          where("eslesmeId", "==", matchDoc.id)
        );

        const messageSnapshot = await getDocs(messageQuery);

        for (const messageDoc of messageSnapshot.docs) {
          await deleteDoc(messageDoc.ref);
        }

        await deleteDoc(matchDoc.ref);
      }

      const offersQuery = query(
        collection(db, "teklifler"),
        where("talepId", "==", request.id)
      );

      const offersSnapshot = await getDocs(offersQuery);

      for (const offerDoc of offersSnapshot.docs) {
        await deleteDoc(offerDoc.ref);
      }

      await deleteDoc(doc(db, "talepler", request.id));

      alert("The request, its offers, matches, and messages have been deleted.");

      router.push("/en/talepler");
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("The request could not be deleted.");
    } finally {
      setLoading(false);
    }
  };

  const isRequestOwner =
    user && request?.kullaniciId === user.uid;

  if (!id || authLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (requestNotFound) {
    return (
      <p className="text-center mt-10">
        This request could not be found.
      </p>
    );
  }

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
          disabled={loading}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete Request"}
        </button>
      )}

      {user && !isRequestOwner && !emailVerified && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-8">
          You must verify your email address before submitting an offer.
        </div>
      )}

      {!user && (
        <div className="bg-gray-100 p-4 rounded mb-8">
          You must log in to submit an offer.
        </div>
      )}

      {user && !isRequestOwner && emailVerified && (
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
              min="0.01"
              step="0.01"
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
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
                    Price: ₺{match.offer?.fiyat ?? "-"}
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
