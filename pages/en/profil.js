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

  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationCooldown, setVerificationCooldown] = useState(0);

  // Load authentication and profile information
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/en/giris");
        return;
      }

      try {
        await currentUser.reload();

        const refreshedUser = auth.currentUser;

        setUser(refreshedUser);
        setEmailVerified(refreshedUser.emailVerified);

        const ref = doc(db, "kullanicilar", refreshedUser.uid);
        const docSnap = await getDoc(ref);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setFullName(
            data.adSoyad || refreshedUser.displayName || ""
          );

          setPhone(data.telefon || "");
        } else {
          setFullName(refreshedUser.displayName || "");
        }

      } catch (error) {
        console.error("Could not load profile:", error);
        alert("Could not load your profile information.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Verification email cooldown
  useEffect(() => {
    if (verificationCooldown <= 0) return;

    const timer = setTimeout(() => {
      setVerificationCooldown((previous) =>
        Math.max(0, previous - 1)
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [verificationCooldown]);

  // Check email verification status
  const handleCheckVerification = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      await currentUser.reload();

      const refreshedUser = auth.currentUser;

      setUser(refreshedUser);
      setEmailVerified(refreshedUser.emailVerified);

      if (refreshedUser.emailVerified) {
        alert("Your email address has been successfully verified.");
      } else {
        alert("Your email address has not been verified yet.");
      }

    } catch (error) {
      console.error("Verification check error:", error);
      alert("Could not check your verification status.");
    }
  };

  // Send verification email
  const handleSendVerification = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser || verificationSending || verificationCooldown > 0) {
      return;
    }

    try {
      setVerificationSending(true);

      await currentUser.reload();

      const refreshedUser = auth.currentUser;

      setUser(refreshedUser);
      setEmailVerified(refreshedUser.emailVerified);

      if (refreshedUser.emailVerified) {
        alert("Your email address has already been verified.");
        return;
      }

      await sendEmailVerification(refreshedUser);

      setVerificationCooldown(60);

      alert(
        "Verification email sent. Please check your inbox."
      );

      console.log("VERIFY MAIL: SUCCESS");

    } catch (error) {
      console.error(
        "VERIFY MAIL ERROR:",
        error.code,
        error.message
      );

      switch (error.code) {
        case "auth/too-many-requests":
          alert(
            "Firebase has temporarily detected too many requests. " +
            "Please wait and try again later."
          );
          break;

        case "auth/network-request-failed":
          alert(
            "The verification email could not be sent due to a network connection issue."
          );
          break;

        case "auth/user-disabled":
          alert(
            "This user account has been disabled."
          );
          break;

        case "auth/invalid-user-token":
        case "auth/user-token-expired":
          alert(
            "Your session has expired. Please sign in again."
          );
          router.push("/en/giris");
          break;

        default:
          alert(
            "Could not send verification email. Error: " +
            (error.code || error.message)
          );
      }

    } finally {
      setVerificationSending(false);
    }
  };

  // Save profile information
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

      alert("Your profile has been successfully updated.");

    } catch (error) {
      console.error("Profile update error:", error);
      alert(
        "Could not update your profile: " + error.message
      );

    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const confirmation = confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmation || !user) return;

    try {
      await deleteDoc(doc(db, "kullanicilar", user.uid));

      await deleteUser(user);

      alert("Your account has been deleted.");

      router.push("/en");

    } catch (error) {
      console.error("Account deletion error:", error);

      if (error.code === "auth/requires-recent-login") {
        alert(
          "For security reasons, please sign in again before deleting your account."
        );
      } else {
        alert(
          "Could not delete your account: " + error.message
        );
      }
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10">
        Loading...
      </p>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        My Profile
      </h1>

      {/* Email verification */}
      {!emailVerified && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-4 rounded mb-6">

          <p className="font-medium mb-2">
            Your email address has not been verified yet.
          </p>

          <p className="text-sm mb-3">
            Please verify your email address to help keep your account secure.
          </p>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={handleSendVerification}
              disabled={
                verificationSending ||
                verificationCooldown > 0
              }
              className="text-blue-700 underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verificationSending
                ? "Sending..."
                : verificationCooldown > 0
                ? `Resend (${verificationCooldown} sec)`
                : "Send verification email"}
            </button>

            <button
              type="button"
              onClick={handleCheckVerification}
              className="text-blue-700 underline font-medium"
            >
              Check verification status
            </button>

          </div>
        </div>
      )}

      {/* Verified email information */}
      {emailVerified && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-6">
          Your email address has been verified.
        </div>
      )}

      {/* Profile form */}
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
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
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
