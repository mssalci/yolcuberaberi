
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function OfferDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [offer, setOffer] = useState(null);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [offererName, setOffererName] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchOffer = async () => {
    if (!id) return;

    try {
      const docRef = doc(db, "teklifler", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setOffer(data);
        setPrice(data.fiyat?.toString() || "");
        setNote(data.not || "");
        setDate(data.tarih || "");

        const user = auth.currentUser;
        if (user && user.uid === data.teklifVerenId) {
          setAuthorized(true);
        }

        if (data.talepId) {
          const requestRef = doc(db, "talepler", data.talepId);
          const requestSnap = await getDoc(requestRef);

          if (requestSnap.exists()) {
            setRequestTitle(
              requestSnap.data().baslik || "Request Title"
            );
          }
        }

        const userRef = doc(db, "kullanicilar", data.teklifVerenId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setOffererName(
            userSnap.data().adSoyad || "Unknown"
          );
        }
      }
    } catch (error) {
      console.error("Error fetching offer:", error);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (date && new Date(date) < new Date(todayStr)) {
      alert("The delivery date cannot be earlier than today.");
      return;
    }

    try {
      await updateDoc(doc(db, "teklifler", id), {
        fiyat: parseFloat(price),
        not: note || "",
        tarih: date || "",
      });

      alert("Offer updated.");
      fetchOffer();
    } catch (error) {
      console.error("Error updating offer:", error);
      alert("An error occurred while updating the offer.");
    }
  };

  if (!offer) return <p className="p-4">Loading...</p>;

  const offerType = offer?.talepId ? "Request" : "Trip";

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="bg-gray-50 border p-4 rounded mb-6 space-y-2">
        <p>
          <strong>{offerType}:</strong>{" "}
          {offer?.talepId ? requestTitle : " "}
        </p>

        <p>
          <strong>Offer Owner:</strong> {offererName || "-"}
        </p>

        {offer.tarih && (
          <p>
            <strong>Delivery Date:</strong> {offer.tarih}
          </p>
        )}

        {offer.kalkisUlke && (
          <p>
            <strong>Departure Country:</strong> {offer.kalkisUlke}
          </p>
        )}

        {offer.varisUlke && (
          <p>
            <strong>Destination Country:</strong> {offer.varisUlke}
          </p>
        )}

        {offer.tahminiTarih && (
          <p>
            <strong>Estimated Arrival Date:</strong> {offer.tahminiTarih}
          </p>
        )}

        {offer.fiyat !== undefined && (
          <p>
            <strong>Offer Price:</strong> ₺{offer.fiyat}
          </p>
        )}

        {offer.not && (
          <p>
            <strong>Offer Note:</strong> {offer.not}
          </p>
        )}

        {typeof offer.mesajSayisi === "number" && (
          <p>
            <strong>Message Count:</strong> {offer.mesajSayisi}
          </p>
        )}
      </div>

      {authorized ? (
        <form
          onSubmit={handleUpdate}
          className="space-y-4 bg-white p-4 border rounded shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayStr}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Price (₺)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Offer
          </button>
        </form>
      ) : (
        <p className="text-red-600 text-sm">
          This offer does not belong to you. You can only view it.
        </p>
      )}
    </div>
  );
}
