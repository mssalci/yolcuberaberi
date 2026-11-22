
import Head from "next/head";
import Link from "next/link";
import { CalendarDays, PackageSearch, Users } from "lucide-react";

export default function EnglishHomePage() {
  return (
    <>
      <Head>
        <title>Travel Together | Bring Items from Abroad & Earn</title>
        <meta
          name="description"
          content="Connect travelers with people who want items brought from abroad. Create a request and earn money on your journey."
        />
        <meta property="og:title" content="Travel Together" />
        <meta
          property="og:description"
          content="Bring items, turn your journey into an opportunity to earn."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://www.yolcuberaberi.com/en"
        />
        <meta property="og:image" content="/og-image.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <main className="p-6 max-w-5xl mx-auto space-y-16">
        {/* Introduction */}
        <section>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Want to bring items from abroad at affordable prices? Find your
            traveler!
          </h1>

          <p className="text-gray-700 mb-6">
            Use the menu above to browse requests, create new requests, or
            manage your matches.
          </p>
        </section>

        {/* How It Works */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <PackageSearch className="mx-auto w-8 h-8 text-blue-600" />

              <h3 className="font-semibold">
                Create an item request or list your upcoming trip
              </h3>

              <p className="text-gray-500 text-sm">
                Describe the item you want and specify the country you want it
                brought from, or enter your destination and travel date.
              </p>
            </div>

            <div className="space-y-3">
              <CalendarDays className="mx-auto w-8 h-8 text-blue-600" />

              <h3 className="font-semibold">
                Make or receive offers and find your travel match
              </h3>

              <p className="text-gray-500 text-sm">
                Match with a traveler visiting the relevant destination on
                the right date.
              </p>
            </div>

            <div className="space-y-3">
              <Users className="mx-auto w-8 h-8 text-blue-600" />

              <h3 className="font-semibold">
                Receive your item and get paid
              </h3>

              <p className="text-gray-500 text-sm">
                Complete the handover and receive your item.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-10">
          <Link href="/en/iletisim">Contact</Link>
        </footer>
      </main>
    </>
  );
}
