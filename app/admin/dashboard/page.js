"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Search,
  LogOut,
  ArrowUpDown,
  X,
  CreditCard,
  Users,
  Shield, // Added Shield icon for the Team button
} from "lucide-react";

export default function AdminDashboard() {
  // Data States
  const [stats, setStats] = useState({ users: 0, totalDonations: 0 });
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [selectedUser, setSelectedUser] = useState(null);

  // --- NEW STATES FOR TEAM MODAL ---
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamSearchTerm, setTeamSearchTerm] = useState("");

  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/");
        return;
      }

      const currentUser = JSON.parse(storedUser);

      if (currentUser.role !== "admin") {
        alert("Access Denied: Admins Only");
        router.push("/user/dashboard");
        return;
      }

      setAdminUser(currentUser);
      
      // Initial Load (Show Spinner)
      await fetchData(false);
    };

    init();

    // --- AUTO-REFRESH LOGIC ---
    // Poll the server every 10 seconds (10000ms)
    const intervalId = setInterval(() => {
      fetchData(true); // Pass true to hide spinner
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);

    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();

        const usersWithTotals = data.users.map((user) => {
          const userTotal = data.donations
            .filter((d) => d.userId === user._id && d.status === "Success")
            .reduce((sum, d) => sum + d.amount, 0);
          return { ...user, totalDonated: userTotal };
        });

        const donationsWithNames = data.donations.map((d) => {
          const payer = data.users.find((u) => u._id === d.userId);
          return { ...d, payerName: payer ? payer.name : "Unknown" };
        });

        const onlyUsersCount = data.users.filter((u) => u.role !== "admin").length;

        setStats({
          ...data.stats,
          users: onlyUsersCount,
        });
        setUsers(usersWithTotals);
        setDonations(donationsWithNames);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (dataList) => {
    return [...dataList]
      .filter((item) => {
        if (activeTab === "users") {
          return (
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          return (
            item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.payerName?.toLowerCase().includes(searchTerm.toLowerCase()) // <--- ADD THIS
          );
        }
      })
      .sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === "createdAt") {
          valA = new Date(a.createdAt);
          valB = new Date(b.createdAt);
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  };

  const visibleUsers =
    activeTab === "users" ? users.filter((u) => u.role !== "admin") : users;

  const sortedData =
    activeTab === "users"
      ? getSortedData(visibleUsers)
      : getSortedData(donations);

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeTab === "users") {
      // 1. Users Export: Exclude Admins
      const usersToExport = users.filter(u => u.role !== "admin");

      csvContent += "Name,Email,Total Donated,Join Date\n" +
        usersToExport.map(u => 
          `${u.name},${u.email},${u.totalDonated},${new Date(u.createdAt).toLocaleDateString()}`
        ).join("\n");

    } else {
      // 2. Payments Export: Name, Amount, Order ID, Status, Date
      csvContent += "Name,Amount,Order ID,Status,Date and Time\n" +
        donations.map(d => 
          `${d.payerName || "Unknown"},${d.amount},${d.orderId},${d.status},${new Date(d.createdAt).toLocaleString().replace(/,/g, " ")}`
        ).join("\n");
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nss_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Logic to Filter Team Members (Admins) ---
  const teamMembers = users.filter((u) => u.role === "admin");
  const filteredTeam = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(teamSearchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800 relative">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of NSS Portal Activities
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* --- NEW: MY TEAM BUTTON --- */}
          <button
            onClick={() => setShowTeamModal(true)}
            className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition font-medium"
          >
            <Shield size={18} /> My Team
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase">
            Total Registrations
          </p>
          <h2 className="text-4xl font-bold text-gray-800 mt-2">
            {stats.users}
          </h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium uppercase">
            Total Donations Received
          </p>
          <h2 className="text-4xl font-bold text-green-600 mt-2">
            ₹ {stats.totalDonations}
          </h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar & Tabs */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Tabs */}
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab("users");
                setSortConfig({ key: "createdAt", direction: "desc" });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "users" ? "bg-white text-blue-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              <Users size={16} /> Users
            </button>
            <button
              onClick={() => {
                setActiveTab("payments");
                setSortConfig({ key: "createdAt", direction: "desc" });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "payments" ? "bg-white text-blue-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              <CreditCard size={16} /> All Payments
            </button>
          </div>

          {/* Search & Export */}
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder={
                  activeTab === "users"
                    ? "Search users..."
                    : "Search Order ID..."
                }
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* --- USERS TAB --- */}
        {activeTab === "users" && (
          <div className="overflow-auto flex-1 p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th
                    className="px-6 py-3 font-medium cursor-pointer"
                    onClick={() => handleSort("totalDonated")}
                  >
                    Total Donated <ArrowUpDown size={14} className="inline" />
                  </th>
                  <th
                    className="px-6 py-3 font-medium cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    Joined <ArrowUpDown size={14} className="inline" />
                  </th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedData.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition group"
                  >
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{user.email}</td>
                    <td className="px-6 py-3 font-semibold text-green-700">
                      ₹ {user.totalDonated}
                    </td>
                    <td className="px-6 py-3 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:bg-blue-50 border border-blue-200 px-3 py-1 rounded-md text-xs font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedData.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500 bg-white"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search size={24} className="text-gray-300" />
                        <p>No user found matching "{searchTerm}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- ALL PAYMENTS TAB --- */}
        {activeTab === "payments" && (
          <div className="overflow-auto flex-1 p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium"> Name</th>
                  <th
                    className="px-6 py-3 font-medium cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    Amount <ArrowUpDown size={14} className="inline" />
                  </th>
                  
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th
                    className="px-6 py-3 font-medium cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    Date <ArrowUpDown size={14} className="inline" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedData.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-gray-800 font-medium">
                      {d.payerName}
                    </td>

                    <td className="px-6 py-3 font-bold text-gray-800">
                      ₹ {d.amount}
                    </td>

                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${
                          d.status === "Success"
                            ? "bg-green-100 text-green-700"
                            : d.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                      {d.orderId}
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {sortedData.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-500 bg-white"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search size={24} className="text-gray-300" />
                        <p>No payment found matching "{searchTerm}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- USER DETAIL MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-900 p-6 flex justify-between items-start text-white">
              <div>
                <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                <p className="text-blue-200 text-sm">{selectedUser.email}</p>
                <p className="text-xs text-blue-300 mt-1">
                  User ID: {selectedUser._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-blue-200 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">
                Transaction History
              </h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations
                    .filter((d) => d.userId === selectedUser._id)
                    .map((tx) => (
                      <tr key={tx._id}>
                        <td className="p-3 font-bold">₹ {tx.amount}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              tx.status === "Success"
                                ? "bg-green-100 text-green-700"
                                : tx.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 text-xs">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {donations.filter((d) => d.userId === selectedUser._id).length ===
                0 && (
                <p className="text-center text-gray-400 mt-4">
                  No transactions found for this user.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- NEW: MY TEAM MODAL --- */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gray-900 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-blue-400" />
                <h2 className="text-lg font-bold">Admin Team</h2>
              </div>
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {/* Team Search Bar */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="w-full pl-9 p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={teamSearchTerm}
                  onChange={(e) => setTeamSearchTerm(e.target.value)}
                />
              </div>

              {/* Team List */}
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredTeam.length > 0 ? (
                  filteredTeam.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                        {member.email === adminUser?.email && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 text-sm py-4">
                    No team members found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
