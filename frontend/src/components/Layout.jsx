import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="brand">
          DocReserve
        </Link>
        <nav>
          <Link to="/">Beranda</Link>
          <Link to="/booking">Daftar Antrean</Link>
          <Link to="/status">Cek Antrean</Link>
          <Link to="/admin" className="admin-link">
            Admin
          </Link>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <footer className="footer">
        &copy; {new Date().getFullYear()} DocReserve - Klinik Dokter Tunggal
      </footer>
    </div>
  );
}
