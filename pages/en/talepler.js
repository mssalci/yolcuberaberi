import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

export default function TripsAndRequests() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(false);

  const { user, loading } = useAuth();

  // REQUESTS
  const fetchRequests = async () => {
    const q = query(
      collection(db, "talepler"),
      orderBy("tarih", "desc"),
      limit(9)
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setRequests(data);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setHasMore(snapshot.docs.length === 9);
    setFiltered(false);
  };

  const loadMore = async () => {
    if (!lastDoc) return;

    const q = query(
      collection(db, "talepler"),
      orderBy("tarih", "desc"),
      startAfter(lastDoc),
      limit(9)
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setRequests((prev) => [...prev, ...data]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);

    if (snapshot.docs.length < 9) {
      setHasMore(false);
    }
  };

  const handleFilterRequests = async (e) => {
    e.preventDefault();

    const keyword = search.trim().toLowerCase();

    if (!keyword) return fetchRequests();

    const snapshot = await getDocs(collection(db, "talepler"));

    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (request) =>
          request.ulke?.toLowerCase().includes(keyword) ||
          request.sehir?.toLowerCase().includes(keyword)
      );

    setRequests(data);
    setHasMore(false);
    setFiltered(true);
  };

  // TRIPS
  const fetchTrips = async () => {
    const snapshot = await getDocs(
      query(
        collection(db, "yolculuklar"),
        orderBy("tarih", "desc")
      )
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTrips(data);
    setFiltered(false);
  };

  const handleFilterTrips = async (e) => {
    e.preventDefault();

    const keyword = search.trim().toLowerCase();

    if (!keyword) return fetchTrips();

    const snapshot = await getDocs(collection(db, "yolculuklar"));

    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (trip) =>
          trip.kalkis?.toLowerCase().includes(keyword) ||
          trip.varis?.toLowerCase().includes(keyword)
      );

    setTrips(data);
    setFiltered(true);
  };

  useEffect(() => {
    if (user && activeTab === "requests") {
      fetchRequests();
    } else if (user) {
      fetchTrips();
    }
  }, [activeTab, user]);

  const clearFilter = () => {
    setSearch("");

    if (activeTab === "requests") {
      fetchRequests();
    } else {
      fetchTrips();
    }
  };

  return (
    <>
      <Head>
        <title>Requests & Trips | Travel Together</title>
        <meta
          name="description"
          content="Browse travel requests and trips."
        />
      </Head>

      <main className="bg-white text-gray-800 min-h-screen">
        <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Requests and Trips
          </h1>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-full ${
                activeTab === "requests"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              All Requests
            </button>

            <button
              onClick={() => setActiveTab("trips")}
              className={`px-4 py-2 rounded-full ${
                activeTab === "trips"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              All Trips
            </button>
          </div>

          {!user && !loading && (
            <div className="text-center p-6 bg-gray-100 rounded-lg">
              <p>
                Please log in to view requests and trips.
              </p>
              <Link
                href="/en/giris"
                className="inline-block mt-3 text-blue-600 hover:underline"
              >
                Log In
              </Link>
            </div>
          )}

          {user && (
            <>
              <form
                onSubmit={
                  activeTab === "requests"
                    ? handleFilterRequests
                    : handleFilterTrips
                }
                className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-10 items-center justify-center"
              >
                <input
                  type="text"
                  placeholder="Country / City"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border px-4 py-2 rounded w-full sm:w-64"
                />

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
                >
                  Filter
                </button>

                {filtered && (
                  <button
                    type="button"
                    onClick={clearFilter}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 w-full sm:w-auto"
                  >
                    Clear
                  </button>
                )}
              </form>

              {activeTab === "requests" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {requests.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500">
                      No requests found.
                    </p>
                  ) : (
                    requests.map((request) => (
                      <div
                        key={request.id}
                        className="border p-6 rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <h3 className="text-xl font-semibold mb-2">
                          {request.baslik}
                        </h3>

                        <p className="mb-2">
                          {request.aciklama}
                        </p>

                        <p className="text-sm text-gray-600 mb-1">
                          Country / City: {request.ulke}
                        </p>

                        <Link
                          href={`/en/talepler/${request.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {trips.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500">
                      No trips found.
                    </p>
                  ) : (
                    trips.map((trip) => (
                      <div
                        key={trip.id}
                        className="border p-6 rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <h3 className="text-lg font-semibold mb-2">
                          Trip
                        </h3>

                        <p className="text-sm mb-1">
                          Departure: {trip.kalkis}
                        </p>

                        <p className="text-sm mb-1">
                          Destination: {trip.varis}
                        </p>

                        <p className="text-sm mb-1">
                          Date: {trip.tarih}
                        </p>

                        <Link
                          href={`/en/yolculuklar/${trip.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "requests" && hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={loadMore}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
