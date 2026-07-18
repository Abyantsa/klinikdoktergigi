import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import HomeView from "../views/HomeView";
import BookingView from "../views/BookingView";
import QueueTicketView from "../views/QueueTicketView";
import AdminLoginView from "../views/AdminLoginView";
import AdminDashboard from "../views/AdminDashboard";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomeView /> },
      { path: "/booking", element: <BookingView /> },
      { path: "/ticket/:id", element: <QueueTicketView /> },
      { path: "/admin/login", element: <AdminLoginView /> },
      { path: "/admin", element: <AdminDashboard /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
