import React from "react";
import AgendaItem from "./AgendaItem";

function AgendaList({ items, checkState, toggleCheck }) {
  return (
    <div className="agenda-list">
      {items.map((item, index) => {
        return (
          <AgendaItem
            key={index}
            item={item}
            checkState={checkState}
            toggleCheck={toggleCheck}
          />
        );
      })}
    </div>
  );
}

export default AgendaList;
