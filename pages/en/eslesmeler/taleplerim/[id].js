
import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { auth, db } from "../../../../firebase/firebaseConfig";

export default function RecordDetail() {
  const router = useRouter();
  const { id, tur } = router.query;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [offerData, setOfferData] = useState({
    fiyat: "",
    not: "",
    tarih: "",
  });

  const handleOfferChange = (e) => {
    setOfferData({
      ...offerData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchOffers = async () => {
    if (!id || !tur) return;

    const field = tur === "yolculuk" ? "yolculukId" : "talepId";

    const q = query(
      collection(db, "teklifler"),
      where(field, "==", id)
    );

    const querySnapshot = await getDocs(q);

    const list = querySnapshot.docs.map((offerDoc) => ({
      id: offerDoc.id,
      ...offerDoc.data(),
    }));

    setOffers(list);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      return alert("Please log in.");
    }

    if (record.kullaniciId === user.uid) {
      return alert("You cannot submit an offer for your own listing.");
    }

    try {
      const offer = {
        ...offerData,
        kullaniciId: user.uid,
        olusturmaZamani: serverTimestamp(),
        kabulEdildi: false,
      };

      offer[tur === "yolculuk" ? "yolculukId" : "talepId"] = id;

      await addDoc(collection(db, "teklifler"), offer);

      alert("Your offer has been submitted successfully!");

      setOfferData({
        fiyat: "",
        not: "",
        tarih: "",
      });

      await fetchOffers();
    } catch (error) {
      alert("Could not submit the offer: " + error.message);
    }
  };

  const handleAcceptOffer = async (offer) => {
    try {
      await updateDoc(doc(db, "teklifler", offer.id), {
        kabulEdildi: true,
        kabulZamani: serverTimestamp(),
      });

      await addDoc(collection(db, "eslesmeler"), {
        [tur === "yolculuk" ? "yolculukId" : "talepId"]: id,
        teklifId: offer.id,
        teklifVerenId: offer.kullaniciId,
        teklifSahibiId: record.kullaniciId,
        tur,
        olusturmaZamani: serverTimestamp(),
      });

      alert("The offer has been accepted and a match has been created.");

      await fetchOffers();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDeleteRecord = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) return;

    try {
      const collectionName =
        tur === "yolculuk" ? "yolculuklar" : "talepler";

      const field =
        tur === "yolculuk" ? "yolculukId" : "talepId";

      const recordRef = doc(db, collectionName, id);

      // Find all offers related to this listing
      const offerQuery = query(
        collection(db, "teklifler"),
        where(field, "==", id)
      );

      const offerSnapshot = await getDocs(offerQuery);

      // Delete related messages and offers
      for (const offerDoc of offerSnapshot.docs) {
        const offerId = offerDoc.id;

        const messageQuery = query(
          collection(db, "mesajlar"),
          where("teklifId", "==", offerId)
        );

        const messageSnapshot = await getDocs(messageQuery);

        for (const messageDoc of messageSnapshot.docs) {
          await deleteDoc(messageDoc.ref);
        }

        await deleteDoc(offerDoc.ref);
      }

      // Delete the listing
      await deleteDoc(recordRef);

      alert("The listing, related offers, and messages have been deleted.");

      router.push("/en/profil");
    } catch (error) {
      alert("Deletion failed: " + error.message);
    }
  };

  useEffect(() => {
    const fetchRecord = async () => {
      if (!router.isReady || !id || !tur) return;

      try {
        const collectionName =
          tur === "yolculuk" ? "yolculuklar" : "talepler";

        const ref = doc(db, collectionName, id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setRecord({
            id: snap.id,
            ...snap.data(),
          });

          await fetchOffers();
        } else {
          alert("Listing not found.");
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [router.isReady, id, tur]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!record) {
    return (
      <p className="text-center mt-10 text-red-600">
        Listing not found.
      </p>
    );
  }

  return (
    <>
      <Head>
        <title>
          {record.baslik || "Trip"} | Yolcu Beraberi
        </title>
      </Head>

      <main className="bg-white text-gray-800 min-h-screen px-4 py-20 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {record.baslik || "Trip Details"}
        </h1>

        {auth.currentUser?.uid === record.kullaniciId && (
          <button
            onClick={handleDeleteRecord}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mb-6"
          >
            Delete Listing
          </button>
        )}

        {tur === "yolculuk" ? (
          <>
            <p className="mb-2 text-gray-700">
              Departure: {record.kalkis}
            </p>

            <p className="mb-2 text-gray-700">
              Destination: {record.varis}
            </p>

            <p className="mb-2 text-gray-700">
              Date: {record.tarih}
            </p>

            <p className="mb-2 text-gray-700">
              Note: {record.not || "-"}
            </p>
          </>
        ) : (
          <>
            <p className="mb-2 text-gray-700">
              {record.aciklama}
            </p>

            <p className="mb-2 text-sm text-gray-600">
              Country: {record.ulke}
            </p>

            <p className="mb-2 text-sm text-gray-600">
              Date:{" "}
              {record.tarih?.toDate?.()
                ? format(record.tarih.toDate(), "dd.MM.yyyy HH:mm")
                : "Unknown"}
            </p>
          </>
        )}

        {auth.currentUser?.uid !== record.kullaniciId && (
          <form
            onSubmit={handleOfferSubmit}
            className="bg-gray-100 p-4 rounded mt-6"
          >
            <h2 className="text-lg font-semibold mb-2">
              Submit an Offer
            </h2>

            <input
              type="text"
              name="fiyat"
              value={offerData.fiyat}
              onChange={handleOfferChange}
              placeholder="Price"
              className="w-full p-2 mb-2 border rounded"
              required
            />

            <input
              type="text"
              name="not"
              value={offerData.not}
              onChange={handleOfferChange}
              placeholder="Note"
              className="w-full p-2 mb-2 border rounded"
            />

            <input
              type="date"
              name="tarih"
              value={offerData.tarih}
              onChange={handleOfferChange}
              className="w-full p-2 mb-2 border rounded"
              required
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send Offer
            </button>
          </form>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Received Offers
          </h2>

          {offers.length === 0 && (
            <p>No offers yet.</p>
          )}

          {offers.map((offer) => (
            <div
              key={offer.id}
              className="border p-4 mb-4 rounded bg-gray-50"
            >
              <p>
                <strong>Price:</strong> {offer.fiyat}
              </p>

              <p>
                <strong>Note:</strong> {offer.not}
              </p>

              <p>
                <strong>Delivery Date:</strong> {offer.tarih}
              </p>

              {!offer.kabulEdildi ? (
                auth.currentUser?.uid === record.kullaniciId && (
                  <button
                    onClick={() => handleAcceptOffer(offer)}
                    className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Accept
                  </button>
                )
              ) : (
                <p className="text-green-700 mt-2 font-semibold">
                  This offer has been accepted.
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
