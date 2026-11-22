
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  sendEmailVerification
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  deleteField
} from "firebase/firestore";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/en/giris");
        return;
      }

      try {
        await currentUser.reload();

        setUser(currentUser);
        setEmailVerified(currentUser.emailVerified);

        const ref = doc(db, "kullanicilar", currentUser.uid);
        const docSnap = await getDoc(ref);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setFullName(data.adSoyad || currentUser.displayName || "");
          setPhone(data.telefon || "");
        } else {
          setFullName(currentUser.displayName || "");
        }
      } catch (error) {
        console.error("Could not retrieve profile information:", error);
        alert("Unable to load profile information.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSendVerification = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        alert("Verification email sent. Please check your inbox.");
      } catch (error) {
        console.error("Could not send verification email:", error);
        alert("Unable to send email. Please try again.");
      }
    }
  };

  const handleSave = async () => {
    if (!user || saving) return;

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanFullName) {
      alert("Please enter your full name.");
      return;
    }

    if (!cleanPhone) {
      alert("Please enter your phone number.");
      return;
    }

    setSaving(true);

    try {
      const ref = doc(db, "kullanicilar", user.uid);

      await setDoc(
        ref,
        {
          uid: user.uid,
          adSoyad: cleanFullName,
          email: user.email,
          telefon: cleanPhone,
          iban: deleteField()
        },
        { merge: true }
      );

      await updateProfile(user, {
        displayName: cleanFullName
      });

      await auth.currentUser.reload();
      setUser(auth.currentUser);

      alert("Your profile has been updated successfully.");
    } catch (error) {
      console.error("Update error:", error);
      alert("Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmed || !user) return;

    try {
      await deleteDoc(doc(db, "kullanicilar", user.uid));
      await deleteUser(user);

      alert("Your account has been deleted.");
      router.push("/en");
    } catch (error) {
      console.error("Account deletion error:", error);
      alert("Unable to delete your account. Please try again.");
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10">Loading...</p>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        My Profile
      </h1>

      {!emailVerified && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
          <p>
            Your email address has not been verified yet.{" "}
            <button
              onClick={handleSendVerification}
              className="text-blue-600 underline font-medium"
            >
              Send verification email
            </button>
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Email (cannot be changed)
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Your phone number"
            autoComplete="tel"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>
    </main>
  );
}
