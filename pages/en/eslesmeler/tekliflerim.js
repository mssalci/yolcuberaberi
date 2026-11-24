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
};const deleteMatch = async (matchId, offerId) => {
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
