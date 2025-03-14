import { useState } from "react";

function AgendaItem({ item, checkState, toggleCheck, path = [] }) {
  const currentPath = [...path, item.title];
  const [messures, setMessures] = useState({
    percentage: item.completionPercentage ?? "0",
    taskChecked:
      item.tasks.filter((task) => task.isChecked === true).length ?? "0",
  });

  const evalMessures = (item) => {
    // Check if item and item.tasks exist
    if (!item || !Array.isArray(item.tasks)) {
      return { percentage: 0, checkedCount: 0, totalTasks: 0 };
    }

    const totalTasks = item.tasks.length;
    const checkedTasks = item.tasks.filter((task) => task.isChecked === true);

    const checkedCount = checkedTasks.length;
    const percentage = totalTasks > 0 ? (checkedCount / totalTasks) * 100 : 0;

    setMessures({
      percentage: parseFloat(percentage.toFixed(2)),
      taskChecked: checkedCount,
    });
  };

  return (
    <div className={`agenda-item ${item.type || ""}`}>
      <div className="item-details">
        {/* Title */}
        <div className="title-task">
          {item.priority && (
            <h3
              className="title-priority"
              style={{
                color:
                  item.priority === "A"
                    ? "#ff6c6b"
                    : item.priority === "B"
                      ? "#98be65"
                      : item.priority === "C"
                        ? "#c678dd"
                        : "inherit",
              }}
            >
              {item.priority === "A"
                ? ""
                : item.priority === "B"
                  ? "󱡞"
                  : item.priority === "C"
                    ? ""
                    : item.priority}
            </h3>
          )}
          <h3>{item.title}</h3>
          <h3 className="color-brand">[{messures.percentage}%]</h3>
          <h3 className="color-brand">
            [{messures.taskChecked}/{item.tasks.length}]
          </h3>
        </div>

        {/* Metadata */}
        {item.timestamp && <a>{item.timestamp}</a>}
        {item.tags && item.tags.length > 0 && (
          <p>
            <strong>Tags:</strong> {item.tags.join(", ")}
          </p>
        )}
        {/* Tasks */}
        {item.tasks && item.tasks.length > 0 && (
          <div className="item-tasks">
            <h4>Tasks:</h4>
            <ul>
              {item.tasks.map((task, index) => {
                const taskPath = [...currentPath, task.title].join(" > ");
                return (
                  <li key={index}>
                    <input
                      type="checkbox"
                      checked={checkState[taskPath] || false}
                      onChange={() => {
                        toggleCheck(taskPath, task);
                        evalMessures(item);
                      }}
                    />
                    <span>{task.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Children */}
        {item.children && item.children.length > 0 && (
          <div className="item-children">
            {item.children.map((child, index) => (
              <AgendaItem
                key={index}
                item={child}
                checkState={checkState}
                toggleCheck={toggleCheck}
                path={currentPath}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AgendaItem;
