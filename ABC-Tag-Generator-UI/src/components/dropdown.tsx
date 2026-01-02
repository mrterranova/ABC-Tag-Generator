import React from "react";
import { categoryLabels } from "../components/constants";

interface CategoryDropdownProps {
  value: string;
  onChange: (category: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
}) => {
  return (
    <select
      style={{width: '90%'}}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="category-dropdown"
    >
      <option value="" disabled>
        Select category
      </option>

      {categoryLabels.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
};

export default CategoryDropdown;
