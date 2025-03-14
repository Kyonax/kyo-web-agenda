import React from "react";

function TabNavigation({ categories, selectedTab, setSelectedTab }) {
  return (
    <div className="tab-navigation">
      {categories.map((category, index) => (
        <button
          key={index}
          className={selectedTab === index ? "tab active" : "tab"}
          onClick={() => setSelectedTab(index)}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;
