import { useState, useEffect, useContext } from "react";
import AuthContext from "../ContextAPI/AuthContext";
import Footer from "../Components/Footer";

const API_URL = "http://localhost:3000/api/projects";

export default function MyBidPage() {
  const { user } = useContext(AuthContext);
  const freelancerEmail = user?.email;

  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMyBids() {
      if (!freelancerEmail) return;

      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const projects = Array.isArray(data.projects) ? data.projects : [];

        const myBids = [];

        projects.forEach((proj) => {
          (proj.list_of_bid || []).forEach((bid) => {
            if (bid.freelancer_email?.trim() === freelancerEmail.trim()) {
              myBids.push({
                projectId: proj.id,
                projectTitle: proj.title,
                projectDescription: proj.description,

                // ------------ CLIENT INFO ------------
                clientName: proj.clientName,
                clientEmail: proj.clientEmail,
                clientAvatar: proj.clientAvatar || "",

                // ------------ BID INFO ------------
                bidId: bid.bid_ID,
                bidDesc: bid.bid_desc,
                priceOffer: bid.price_offer,
                bidStatus: bid.bid_status,
                clientStatus: bid.client_status || null,
              });
            }
          });
        });

        setBids(myBids);
      } catch (err) {
        console.error("Error fetching bids:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyBids();
  }, [freelancerEmail]);

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return amount;
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  if (!user || user.role !== "freelancer") {
    return (
      <div className="p-8 text-center text-xl font-semibold">
        Unauthorized access.
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-xl">Loading your bids...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-xl text-red-600 font-semibold">
        Error connecting API.
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="p-8 text-center text-xl font-semibold">
        You haven’t submitted any bids yet.
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-8 font-poppins">
        <h1 className="text-4xl font-bold mb-10 text-gray-800">My Bids</h1>
        <hr className="mb-8" />

        {bids.map((bid) => (
          <div
            key={bid.bidId}
            className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {bid.projectTitle}
            </h2>
            <p className="text-gray-600 mb-4">{bid.projectDescription}</p>

            <div className="flex flex-wrap gap-4 items-center mb-4 text-sm font-medium">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Offer: {formatCurrency(bid.priceOffer)}
              </span>

              <span
                className={`px-3 py-1 rounded-full ${
                  bid.bidStatus === "accepted"
                    ? "bg-green-100 text-green-800"
                    : bid.clientStatus === "client_rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                Bid status:{" "}
                {bid.clientStatus === "client_rejected"
                  ? "Client Rejected"
                  : bid.bidStatus}
              </span>
            </div>

            <p className="text-gray-800 mb-4">
              Your proposal: <em>{bid.bidDesc}</em>
            </p>

            {/* ---------- SHOW CLIENT INFO IF FREELANCER WAS ACCEPTED ---------- */}
            {bid.bidStatus === "accepted" && (
              <div className="p-4 bg-gray-50 border rounded-lg mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Client Information
                </h3>

                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {bid.clientAvatar ? (
                    <img
                      src={bid.clientAvatar}
                      alt="avatar"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                      No Avatar
                    </div>
                  )}

                  <div>
                    <p className="text-gray-800 text-lg font-semibold">
                      Name: {bid.clientName}
                    </p>
                    <p className="text-gray-700">Email: {bid.clientEmail}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
}
