import Sidebar from "./Sidebar";
import "../style.css";

const Dashboard = () => (
  <>
    <Sidebar />

    <div className="min-h-screen bg-gray-50 text-gray-900">

      <main className="p-8 max-md:p-4 max-md:pb-20 items-center flex justify-center">
        <div className="container text-center mx-auto">
          <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
          <p className="text-gray-600">Placeholder for Dashboard Content</p>
        </div>
      </main>
    </div>
  </>
);

export default Dashboard;