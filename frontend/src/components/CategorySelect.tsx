import { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import { toast } from 'react-toastify';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CategorySelect: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${API_BASE}/api/v1/categories/`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setCategories(data.map((c: any) => c.category_description));
      } catch {
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <select
      className="wpsi-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
    >
      <option value="">
        {isLoading ? 'Loading categories...' : 'Categories'}
      </option>
      {categories.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
};

export default CategorySelect;