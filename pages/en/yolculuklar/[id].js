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

export default function TripDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [trip, setTrip] = useState(null);
  const [tripNotFound, setTripNotFound] = useState(false);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [tripOwnerName, setTripOwnerName] = useState("");

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

    const fetchTrip = async () => {
      try {
        const tripRef = doc(db, "yolculuklar", id);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) {
          setTripNotFound(true);
          return;
        }

        const tripData = {
          id: tripSnap.id,
          ...tripSnap.data(),
        };

        setTrip(tripData);

        if (tripData.kullaniciId) {
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
        const matchesQuery = query(
          collection(db, "eslesmeler"),
          where("yolculukId", "==", id)
        );

        const snapshot = await getDocs(matchesQuery);
        const data = [];

        for (const matchDoc of snapshot.docs) {
          const matchData = matchDoc.data();

          let offer = null;
          let offerSenderName = "Unknown";

          if (matchData.teklifId) {
            const offerSnap = await getDoc(
              doc(db, "teklifler", matchData.teklifId)
            );

            if (offerSnap.exists()) {
              offer = offerSnap.data();
            }
          }

          if (matchData.teklifVerenId) {
            const offerSenderRef = doc(
              db,
              "kullanicilar",
              matchData.teklifVerenId
            );

            const offerSenderSnap = await getDoc(offerSenderRef);

            if (offerSenderSnap.exists()) {
              offerSenderName =
                offerSenderSnap.data().adSoyad || "Unknown";
            }
          }

          data.push({
            id: matchDoc.id,
            ...matchData,
            offer,
            offerSenderName,
          });
        }

        setMatches(data);
      } catch (error) {
        console.error("Could not fetch matches:", error);
      }
    };

    fetchTrip();
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

      if (!trip || trip.kullaniciId === currentUser.uid) {
        alert("You cannot submit an offer for your own trip.");
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
          "You have already submitted an offer. You cannot submit another one."
        );
        return;
      }

      const existingMatch = matches.some(
        (match) => match.teklifVerenId === currentUser.uid
      );

      if (existingMatch) {
        alert("You have already submitted an offer for this trip.");
        return;
      }

      const batch = writeBatch(db);

      const offerRef = doc(collection(db, "teklifler"));
      const matchRef = doc(collection(db, "eslesmeler"));

      batch.set(offerRef, {
        yolculukId: trip.id,
        teklifVerenId: currentUser.uid,
        fiyat: parsedPrice,
        not: note,
        tarih: date,
        olusturmaZamani: serverTimestamp(),
      });

      batch.set(matchRef, {
        yolculukId: trip.id,
        teklifId: offerRef.id,
        teklifVerenId: currentUser.uid,
        yolculukSahibiId: trip.kullaniciId,
        olusturmaZamani: serverTimestamp(),
      });

await batch.commit();

// Send email notification to the request owner.
try {
  const idToken = await currentUser.getIdToken();

  const response = await fetch("/api/teklif-bildir", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      offerId: offerRef.id,
    }),
  });

  if (!response.ok) {
    console.error(
      "Offer email notification failed:",
      await response.text()
    );
  }
} catch (notificationError) {
  console.error("Email notification error:", notificationError);
}

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
  const currentUser = auth.currentUser;

  if (!currentUser || !trip) return;

  if (trip.kullaniciId !== currentUser.uid) {
    alert("You are not authorized to delete this trip.");
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete this trip and all related offers and messages?"
  );

  if (!confirmed) return;

  try {
    setLoading(true);

    const matchesQuery = query(
      collection(db, "eslesmeler"),
      where("yolculukId", "==", trip.id)
    );

    const matchesSnapshot = await getDocs(matchesQuery);

    // Delete messages and their associated matches.
    for (const matchDoc of matchesSnapshot.docs) {
      // Delete messages in the match's chat.
      const messagesQuery = collection(
        db,
        "chat",
        matchDoc.id,
        "messages"
      );

      const messagesSnapshot = await getDocs(messagesQuery);

      for (const messageDoc of messagesSnapshot.docs) {
        await deleteDoc(messageDoc.ref);
      }

      // Delete the match.
      await deleteDoc(matchDoc.ref);
    }

    // Delete related offers.
    const offersQuery = query(
      collection(db, "teklifler"),
      where("yolculukId", "==", trip.id)
    );

    const offersSnapshot = await getDocs(offersQuery);

    for (const offerDoc of offersSnapshot.docs) {
      await deleteDoc(offerDoc.ref);
    }

    // Finally, delete the trip.
    await deleteDoc(doc(db, "yolculuklar", trip.id));

    alert("The trip, its offers, matches, and messages have been deleted.");

    router.push("/en/talepler?sekme=yolculuklar");
  } catch (error) {
    console.error("Error deleting trip:", error);
    alert("An error occurred while deleting the trip.");
  } finally {
    setLoading(false);
  }
};

  const isTripOwner =
    user && trip?.kullaniciId === user.uid;

  if (!id || authLoading) {
    return <p className="p-4 text-center">Loading...</p>;
  }

  if (tripNotFound) {
    return (
      <p className="p-4 text-center">
        This trip could not be found.
      </p>
    );
  }

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
          disabled={loading}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete Trip"}
        </button>
      )}

      {user && !isTripOwner && !emailVerified && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-8">
          You must verify your email address before submitting an offer.
        </div>
      )}

      {!user && (
        <div className="bg-gray-100 p-4 rounded mb-8">
          You must log in to submit an offer.
        </div>
      )}

      {user && !isTripOwner && emailVerified && (
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
                    Price: ₺{match.offer?.fiyat ?? "-"}
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
