import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import RfpForm from '../components/RfpForm';

const EditRfpMonitoring = () => {
  const { id } = useParams();

  return (
    <>
      <Sidebar />
      <div className="dashboard-content">
        <RfpForm mode="edit" expectedSeries={id} />
      </div>
    </>
  );
};

export default EditRfpMonitoring;