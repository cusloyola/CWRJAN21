import Sidebar from "./Sidebar";
import '../styles/style.css';

const WMSI = () => {
  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 text-gray-900">

        <main className="p-8 max-md:p-4 max-md:pb-20 items-center flex justify-center">
          <div className="container text-center mx-auto">
            <h2 className="text-3xl font-bold mb-4">WMSI</h2>
            <p className="text-gray-600">Placeholder for WMSI Content</p>
          </div>
        </main>
      </div>
    </>
  );
};

export default WMSI;
