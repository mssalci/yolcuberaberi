
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const router = useRouter();
  const [language, setLanguage] = useState("tr");

  useEffect(() => {
    const currentLanguage = router.asPath.startsWith("/en")
      ? "en"
      : "tr";

    setLanguage(currentLanguage);
  }, [router.asPath]);

  const changeLanguage = (newLanguage) => {
    if (newLanguage !== "tr" && newLanguage !== "en") {
      return;
    }

    const currentPath = router.asPath.split("?")[0];
    const queryString = router.asPath.includes("?")
      ? router.asPath.substring(router.asPath.indexOf("?"))
      : "";

    let newPath;

    if (newLanguage === "en") {
      if (currentPath === "/") {
        newPath = "/en";
      } else if (currentPath.startsWith("/en")) {
        newPath = currentPath;
      } else {
        newPath = `/en${currentPath}`;
      }
    } else {
      if (currentPath === "/en") {
        newPath = "/";
      } else if (currentPath.startsWith("/en/")) {
        newPath = currentPath.replace(/^\/en/, "");
      } else {
        newPath = currentPath;
      }
    }

    router.push(`${newPath}${queryString}`);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        isEnglish: language === "en",
        isTurkish: language === "tr",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider"
    );
  }

  return context;
}
