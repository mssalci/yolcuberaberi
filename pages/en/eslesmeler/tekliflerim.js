
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";

export default function MyOffers() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Fetch offers submitted by the current user
        const offersSnap = await getDocs(
          query(
            collection(db, "teklifler"),
            where("teklifVerenId", "==", user.uid)
          )
        );

        const matchesArr = [];

        for (const offerDoc of offersSnap.docs) {
          const offerData = offerDoc.data();

          const matchSnap = await getDocs(
            query(
              collection(db, "eslesmeler"),
              where("teklifId", "==", offerDoc.id)
            )
          );

          for (const matchDoc of matchSnap.docs) {
            const matchData = matchDoc.data();

            const requestDoc = matchData.talepId
              ? await getDoc(doc(db, "talepler", matchData.talepId))
              : null;

            matchesArr.push({
              id: matchDoc.id,
              type: matchData.talepId ? "request" : "unknown",
              request: requestDoc?.exists()
                ? { id: requestDoc.id, ...requestDoc.data() }
                : null,
              offer: { id: offerDoc.id, ...offerData },
            });
          }
        }

        setMatches(matchesArr);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  const deleteMatch = async (matchId, offerId) => {
    if (
      !confirm(
        "Are you sure you want to delete this match, its messages, and its related offer?"
      )
    ) {
      return;
    }

    try {
      // First, delete messages in the match's chat.
      const messagesQuery = collection(
        db,
        "chat",
        matchId,
        "messages"
      );

      const messagesSnapshot = await getDocs(messagesQuery);

      for (const messageDoc of messagesSnapshot.docs) {
        await deleteDoc(messageDoc.ref);
      }

      // Then delete the match.
      await deleteDoc(doc(db, "eslesmeler", matchId));

      // Finally, delete the offer.
      if (offerId) {
        await deleteDoc(doc(db, "teklifler", offerId));
      }

      setMatches((prev) =>
        prev.filter((match) => match.id !== matchId)
      );

      alert("The match, its messages, and offer have been deleted.");
    } catch (err) {
      console.error("Error deleting match:", err);
      alert("An error occurred while deleting.");
    }
  };

  if (!authChecked) return null;

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="mb-3">You need to log in to view your offers.</p>
          <Link href="/en/giris" className="text-blue-600 underline">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Offers</h1>

      {loading ? (
        <p>Loading...</p>
      ) : matches.length === 0 ? (
        <p>You haven't submitted any offers yet.</p>
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => (
            <li
              key={match.id}
              className="border p-4 rounded bg-white shadow space-y-2"
            >
              {match.type === "request" && match.request ? (
                <>
                  <p className="font-semibold">
                    Request Title: {match.request.baslik || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Request Description: {match.request.aciklama || "-"}
                  </p>
                </>
              ) : (
                <p>Unknown match type</p>
              )}

              {match.offer && (
                <>
                  <p className="text-sm text-gray-600">
                    Offer Price: ₺{match.offer.fiyat}
                  </p>
                  <p className="text-sm text-gray-600">
                    Offer Note: {match.offer.not || "-"}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link
                      href={`/en/eslesmeler/tekliflerim/${match.offer.id}`}
                      className="text-blue-600 underline"
                    >
                      Offer Details
                    </Link>

                    <Link
                      href={`/en/chat/${match.id}`}
                      className="text-green-600 underline"
                    >
                      Message
                    </Link>

                    <button
                      onClick={() =>
                        deleteMatch(match.id, match.offer.id)
                      }
                      className="text-red-600 underline"
                    >
                      Delete Match and Offer
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
