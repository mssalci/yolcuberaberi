
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";

export default function MyRequests() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [requests, setRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch the user's requests and their offers
        const requestSnap = await getDocs(
          query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))
        );

        const requestsArr = [];

        for (const requestDoc of requestSnap.docs) {
          const requestData = requestDoc.data();

          const offerSnap = await getDocs(
            query(collection(db, "teklifler"), where("talepId", "==", requestDoc.id))
          );

const offers = await Promise.all(
  offerSnap.docs.map(async (offerDoc) => {
    const matchSnap = await getDocs(
      query(
        collection(db, "eslesmeler"),
        where("teklifId", "==", offerDoc.id)
      )
    );

    return {
      id: offerDoc.id,
      ...offerDoc.data(),
      matchId: matchSnap.docs[0]?.id || null,
    };
  })
);

          requestsArr.push({
            id: requestDoc.id,
            ...requestData,
            teklifler: offers,
          });
        }

        // Fetch the user's trips and their offers
        const tripSnap = await getDocs(
          query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))
        );

        const tripsArr = [];

        for (const tripDoc of tripSnap.docs) {
          const tripData = tripDoc.data();

          const offerSnap = await getDocs(
            query(collection(db, "teklifler"), where("yolculukId", "==", tripDoc.id))
          );

const offers = await Promise.all(
  offerSnap.docs.map(async (offerDoc) => {
    const matchSnap = await getDocs(
      query(
        collection(db, "eslesmeler"),
        where("teklifId", "==", offerDoc.id)
      )
    );

    return {
      id: offerDoc.id,
      ...offerDoc.data(),
      matchId: matchSnap.docs[0]?.id || null,
    };
  })
);

          tripsArr.push({
            id: tripDoc.id,
            ...tripData,
            teklifler: offers,
          });
        }

        setRequests(requestsArr);
        setTrips(tripsArr);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Delete a request or trip, including its related offers
  const deleteItem = async (itemType, itemId) => {
    const itemName = itemType === "talep" ? "request" : "trip";

    if (
      !confirm(
        `Are you sure you want to delete this ${itemName} and its related offers?`
      )
    ) {
      return;
    }

    try {
      const offerQuery = query(
        collection(db, "teklifler"),
        where(itemType === "talep" ? "talepId" : "yolculukId", "==", itemId)
      );

      const offerSnap = await getDocs(offerQuery);

      for (const offerDoc of offerSnap.docs) {
        await deleteDoc(doc(db, "teklifler", offerDoc.id));
      }

      await deleteDoc(
        doc(db, itemType === "talep" ? "talepler" : "yolculuklar", itemId)
      );

      if (itemType === "talep") {
        setRequests((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        setTrips((prev) => prev.filter((item) => item.id !== itemId));
      }

      alert(`The ${itemName} and its related offers have been deleted.`);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("An error occurred while deleting the item.");
    }
  };

  if (!authChecked) return null;

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="mb-3">You need to log in to view your requests and trips.</p>
          <Link href="/en/giris" className="text-blue-600 underline">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Requests & Trips</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Requests */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">My Requests</h2>

            {requests.length === 0 ? (
              <p>You don't have any requests yet.</p>
            ) : (
              <ul className="space-y-4">
                {requests.map((request) => (
                  <li
                    key={request.id}
                    className="border p-4 rounded bg-white shadow space-y-2"
                  >
                    <p className="font-semibold">
                      Request: {request.baslik || "-"}
                    </p>
                    <p>Description: {request.aciklama || "-"}</p>
                    <p>Budget: ₺{request.butce || "-"}</p>

                    <div className="mt-2">
                      <p className="font-semibold">Offers Received:</p>

                      {request.teklifler.length === 0 ? (
                        <p>No offers yet.</p>
                      ) : (
                        <ul className="space-y-1">
                          {request.teklifler.map((offer) => (
                            <li
                              key={offer.id}
                              className="flex flex-wrap gap-3 items-center text-sm"
                            >
                              <span>
                                <p>Price: ₺{offer.fiyat}</p>
                                <p>Note: {offer.not || "-"}</p>
                              </span>

                              <Link
                                href={`/en/eslesmeler/tekliflerim/${offer.id}`}
                                className="text-blue-600 underline"
                              >
                                Offer Details
                              </Link>

{offer.matchId && (
  <Link
    href={`/en/chat/${offer.matchId}`}
    className="text-green-600 underline"
  >
    Message
  </Link>
)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      onClick={() => deleteItem("talep", request.id)}
                      className="mt-3 text-red-600 underline"
                    >
                      Delete Request
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Trips */}
          <section>
            <h2 className="text-xl font-semibold mb-4">My Trips</h2>

            {trips.length === 0 ? (
              <p>You don't have any trips yet.</p>
            ) : (
              <ul className="space-y-4">
                {trips.map((trip) => (
                  <li
                    key={trip.id}
                    className="border p-4 rounded bg-white shadow space-y-2"
                  >
                    <p>
                      <strong>Departure:</strong> {trip.kalkis || "-"}{" "}
                      - <strong>Destination:</strong> {trip.varis || "-"}
                    </p>

                    <p>
                      <strong>Note:</strong> {trip.not || "-"}
                    </p>

                    <p>
                      <strong>Trip Date:</strong>{" "}
                      {trip.tarihOlusturma?.toDate
                        ? trip.tarihOlusturma.toDate().toLocaleDateString("en-GB")
                        : trip.tarih || "-"}
                    </p>

                    <div className="mt-2">
                      <p className="font-semibold">Offers Received:</p>

                      {trip.teklifler.length === 0 ? (
                        <p>No offers yet.</p>
                      ) : (
                        <ul className="space-y-1">
                          {trip.teklifler.map((offer) => (
                            <li
                              key={offer.id}
                              className="flex flex-wrap gap-3 items-center text-sm"
                            >
                              <span>
                                <p>Price: ₺{offer.fiyat}</p>
                                <p>Note: {offer.not || "-"}</p>
                              </span>

                              <Link
                                href={`/en/eslesmeler/tekliflerim/${offer.id}`}
                                className="text-blue-600 underline"
                              >
                                Offer Details
                              </Link>

{offer.matchId && (
  <Link
    href={`/en/chat/${offer.matchId}`}
    className="text-green-600 underline"
  >
    Message
  </Link>
)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      onClick={() => deleteItem("yolculuk", trip.id)}
                      className="mt-3 text-red-600 underline"
                    >
                      Delete Trip
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
