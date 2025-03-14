import React, { useState, useEffect } from "react";
import { fetchOrgFile, parseOrgFile } from "../services/orgParser";
import TabNavigation from "./TabNavigation";
import AgendaList from "./AgendaList";

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [checkState, setCheckState] = useState(() => {
    const savedData = localStorage.getItem("checkState");
    return savedData ? JSON.parse(savedData) : false;
  });
  // const [checkState, setCheckState] = useState({});
  const [error, setError] = useState(null);

  // Fetch and parse the .org file on mount
  useEffect(() => {
    async function loadData() {
      try {
        const content = await fetchOrgFile();
        const parsedCategories = parseOrgFile(content);
        setCategories(parsedCategories);
        setError(null);
      } catch (err) {
        setError("Failed to load agenda data. Please try again later.");
        console.error(err);
      }
    }
    loadData();
  }, []);

  // Load check state from localStorage on mount
  useEffect(() => {
    const savedCheckState = localStorage.getItem("checkState");
    if (Object.keys(checkState).length !== 0) {
      setCheckState(JSON.parse(savedCheckState));
    } else {
      async function loadChecks() {
        const content = await fetchOrgFile();
        const parsedContent = parseOrgFile(content);
        const items = parsedContent[selectedTab]?.items || [];

        if (!items?.some((item) => "tasks" in item)) return;

        const checkStateObject = {};

        items.forEach((item) => {
          if (item.tasks) {
            item.tasks.forEach((task) => {
              if (task.isChecked) {
                const key = `${item.title} > ${task.title}`;
                checkStateObject[key] = true;
              }
            });
          }
        });

        // Save the array to local storage as a JSON string
        localStorage.setItem("checkState", JSON.stringify(checkStateObject));
        setCheckState(checkStateObject);
      }

      loadChecks();
    }
  });

  // Save check state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("checkState", JSON.stringify(checkState));
  }, [checkState]);

  // Toggle the check state for a task
  const toggleCheck = (path, task) => {
    setCheckState((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));

    task.isChecked = !checkState[path];
  };

  const asciiBanner = ` _  ____   _____  _ ____       _    ____ _____ _   _ ____    _\n\
| |/ /\\ \\ / / _ \\( ) ___|     / \\  / ___| ____| \\ | |  _ \\  / \\\n\
| ' /  \\ V / | | |/\\___ \\    / _ \\| |  _|  _| |  \\| | | | |/ _ \\\n\
| . \\   | || |_| |  ___) |  / ___ \\ |_| | |___| |\\  | |_| / ___ \\\n\
|_|\\_\\  |_| \\___/  |____/  /_/   \\_\\____|_____|_| \\_|____/_/   \\_\\\n\
`;

  function TextArt({ label, text }) {
    return <pre aria-label={label}>{text}</pre>;
  }

  return (
    <div className="app">
      <div className="ascii">
        <TextArt
          label="ASCII art depicting a person fishing from an island which has a single palm tree"
          text={asciiBanner}
        />
        <p>
          The Org Agenda preview-module syncs all my TODO's across all my
          devices.
        </p>
      </div>
      {error ? (
        <p className="error">{error}</p>
      ) : categories.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <>
          <TabNavigation
            categories={categories}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          <AgendaList
            items={categories[selectedTab]?.items || []}
            checkState={checkState}
            toggleCheck={toggleCheck}
          />
        </>
      )}
      <p>
        Made with 💗{" "}
        <a href="https://x.com/kyonax_on_tech" target="__blank">
          Cristian D. Moreno - Kyonax
        </a>
      </p>
    </div>
  );
}

export default App;
