# NSS IIT Roorkee - Donation Portal

**Live Demo:** [https://nss-donation-portal-five.vercel.app/](https://nss-donation-portal-project.vercel.app/)

A full-stack web application designed to facilitate, manage, and track donations for the National Service Scheme (NSS) at IIT Roorkee. The portal provides a seamless experience for donors to contribute and track their history, while offering administrators powerful tools to monitor transactions and manage team members.

## 🚀 Features

### 👤 User Panel
* **Secure Authentication:** User registration and login with encrypted passwords.
* **Donation Processing:** Integrated **Razorpay Payment Gateway** for secure transactions.
* **Real-time Status:** Instant updates on payment status (Success, Pending, Failed).
* **Donation History:** Users can view a complete log of their past contributions with dates and amounts.
* **Profile Management:** View registered details and role status.

###  Admin Dashboard
* **Dual-View Management:**
    * **Users Tab:** View individual user performance, total amount donated per user, and join dates.
    * **All Payments Tab:** A global view of every transaction ever made on the platform.
* **Advanced Sorting & Searching:**
    * **Sort By:** Date (Newest/Oldest), Amount (High/Low), and Total Donated.
    * **Search:** Filter records instantly by Name, Email, or Order ID.
* **Team Management:** "My Team" feature to quickly view other administrators.
* **Data Export:** One-click CSV export for both User Lists and Transaction Logs.
* **Live Updates:** Dashboard refreshes automatically every 10 seconds to show new donations without reloading.

### ⚙️ System Logic
* **Auto-Failure Mechanism:** Any payment left in a "Pending" state for more than **15 minutes** is automatically marked as "Failed" to maintain accurate records.
* **Role-Based Access Control:** Strict route protection ensures only authorized Admins can access sensitive data.

## 🛠️ Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS, Lucide React (Icons)
* **Backend:** Next.js API Routes (Serverless)
* **Database:** MongoDB (Mongoose)
* **Payment Gateway:** Razorpay
* **Deployment:** Vercel

## 🔧 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/nss-donation-portal.git](https://github.com/your-username/nss-donation-portal.git)
    cd nss-donation-portal
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the following:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_secret_key
    NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit `http://localhost:3000` in your browser.

## 📄 License
This project is developed for NSS IIT Roorkee.
