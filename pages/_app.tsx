import type { AppProps } from "next/app";
import Link from "next/link";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="app">
      <header className="nav">
        <div className="nav-left">
           
        </div>
 
      </header>

      <main className="main-content">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
