// components/Layout.js
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="p-6 bg-gray-50 min-h-screen">{children}</main>
    </>
  );
}
