import type { AppProps } from "next/app";
import Link from "next/link";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="app">
      <header className="nav">
        <div className="nav-left">
          <span className="logo">Canada Men's National Team Squad Tracker</span>
        </div>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/players">Players</Link>
          <Link href="/callups">Call-ups</Link>
          <Link href="/depth-chart">Depth Chart</Link>
          <Link href="/timeline">Timeline</Link>
        </nav>
      </header>

      <main className="main-content">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
