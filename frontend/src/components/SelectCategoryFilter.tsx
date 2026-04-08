import { useEffect, useState } from 'react';
import { API_BASE, getAuthHeader } from '../config/api';
import { toast } from 'react-toastify';

interface Category {
  category_id: string;
  category_type: string;
  category_description: string;
  company: number;
  date_created: string;
}

interface Props {
  value?: string;
  onChange: (categoryId: string) => void;
}

const CategorySelect: React.FC<Props> = ({ onChange }:Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${API_BASE}/api/v1/categories/`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) throw new Error();

        const data: Category[] = await res.json();
        setCategories(data);
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
      onChange={(e) => {
        if (e.target.value === "") {
            onChange("All"); // return ALL when empty option selected
            return;
        }        
        const selectedCat = categories.find(cat => cat.category_id === e.target.value);
        if (selectedCat) {
        onChange(selectedCat.category_description); // pass description
        }
      }}
      disabled={isLoading}
    >
      <option value="">
        {isLoading ? 'Loading categories...' : 'Categories'}
      </option>
      {categories.map((cat) => (
        <option key={cat.category_id} value={cat.category_id}>
          {cat.category_description}
        </option>
      ))}
    </select>
  );
};

export default CategorySelect;