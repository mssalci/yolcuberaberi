
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

export default function TripDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [trip, setTrip] = useState(null);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [user, setUser] = useState(null);
  const [tripOwnerName, setTripOwnerName] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const ref = doc(db, "yolculuklar", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const tripData = { id: snap.id, ...snap.data() };
          setTrip(tripData);

          // Fetch the trip owner's name
          const userRef = doc(
            db,
            "kullanicilar",
            tripData.kullaniciId
          );

          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setTripOwnerName(
              userSnap.data().adSoyad || "Unknown"
            );
          }
        }
      } catch (error) {
        console.error("Could not fetch trip:", error);
      }
    };

    const fetchMatches = async () => {
      try {
        const q = query(
          collection(db, "eslesmeler"),
          where("yolculukId", "==", id)
        );

        const snapshot = await getDocs(q);
        const data = [];

        for (let docSnap of snapshot.docs) {
          const offerDoc = await getDoc(
            doc(db, "teklifler", docSnap.data().teklifId)
          );

          // Fetch the offer sender's name
          const offerSenderRef = doc(
            db,
            "kullanicilar",
            docSnap.data().teklifVerenId
          );

          const offerSenderSnap = await getDoc(offerSenderRef);

          data.push({
            id: docSnap.id,
            ...docSnap.data(),
            offer: offerDoc.exists() ? offerDoc.data() : null,
            offerSenderName: offerSenderSnap.exists()
              ? offerSenderSnap.data().adSoyad
              : "Unknown",
          });
        }

        setMatches(data);
      } catch (error) {
        console.error("Could not fetch matches:", error);
      }
    };

    if (id) {
      fetchTrip();
      fetchMatches();
    }
  }, [id]);

  const handleSubmitOffer = async (e) => {
    e.preventDefault();

    if (!user) return;

    if (!user.emailVerified) {
      alert("You must verify your email address before submitting an offer.");
      return;
    }

    if (!price || !trip) return;

    if (new Date(date) < new Date(todayStr)) {
      alert("The delivery date cannot be earlier than today.");
      return;
    }

    try {
      const offerQuery = query(
        collection(db, "teklifler"),
        where("teklifVerenId", "==", user.uid)
      );

      const offerSnapshot = await getDocs(offerQuery);

      if (!offerSnapshot.empty) {
        alert("You have already submitted an offer. You cannot submit another one.");
        return;
      }
    } catch (error) {
      console.error("Error checking existing offers:", error);
      alert("An error occurred while checking your offers.");
      return;
    }

    const existingOffer = matches.some(
      (match) => match.teklifVerenId === user.uid
    );

    if (existingOffer) {
      alert("You have already submitted an offer for this trip.");
      return;
    }

    try {
      setLoading(true);

      const offerRef = await addDoc(collection(db, "teklifler"), {
        yolculukId: trip.id,
        teklifVerenId: user.uid,
        fiyat: parseFloat(price),
        not: note,
        tarih: date,
        olusturmaZamani: serverTimestamp(),
      });

      await addDoc(collection(db, "eslesmeler"), {
        yolculukId: trip.id,
        teklifId: offerRef.id,
        teklifVerenId: user.uid,
        yolculukSahibiId: trip.kullaniciId,
        olusturmaZamani: serverTimestamp(),
      });

      alert("Your offer and match have been created successfully.");

      setPrice("");
      setNote("");
      setDate("");
      router.reload();
    } catch (error) {
      console.error("Could not create offer:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed) return;

    try {
      const matchQuery = query(
        collection(db, "eslesmeler"),
        where("yolculukId", "==", trip.id)
      );

      const matchSnapshot = await getDocs(matchQuery);

      for (const matchDoc of matchSnapshot.docs) {
        const match = matchDoc.data();
        const offerId = match.teklifId;

        await deleteDoc(doc(db, "teklifler", offerId));

        const messageQuery = query(
          collection(db, "mesajlar"),
          where("eslesmeId", "==", matchDoc.id)
        );

        const messageSnapshot = await getDocs(messageQuery);

        for (const message of messageSnapshot.docs) {
          await deleteDoc(message.ref);
        }

        await deleteDoc(matchDoc.ref);
      }

      await deleteDoc(doc(db, "yolculuklar", trip.id));

      alert("The trip, its offers, and messages have been deleted.");

      router.push("/en/talepler?sekme=yolculuklar");
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("An error occurred while deleting the trip.");
    }
  };

  const isTripOwner =
    user && trip?.kullaniciId === user.uid;

  if (!trip) {
    return <p className="p-4 text-center">Loading...</p>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">
        Trip Details
      </h1>

      <div className="space-y-3">
        <p className="text-gray-700">
          Departure: {trip.kalkis}
        </p>

        <p className="text-gray-700">
          Destination: {trip.varis}
        </p>

        <p className="text-gray-600 text-sm mb-1">
          Date: {trip.tarih || "-"}
        </p>

        <p className="text-gray-700">
          Trip Owner: {tripOwnerName || "-"}
        </p>

        <p className="text-gray-700">
          Note: {trip.not || "-"}
        </p>
      </div>

      {isTripOwner && (
        <button
          onClick={handleDeleteTrip}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Trip
        </button>
      )}

      {user && !isTripOwner && (
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

      {matches.length > 0 && isTripOwner && (
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
                    Offer Submitted By: {match.offerSenderName}
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
