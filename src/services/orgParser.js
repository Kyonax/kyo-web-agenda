import axios from "axios";

// Use environment variable for the PAT (set during build or dev)
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const OWNER = process.env.REACT_APP_OWNER; // Replace with your GitHub username
const REPO = process.env.REACT_APP_REPO; // Replace with your repository name
const PATH = "roam-nodes/20240912084617-agenda.org"; // Path to your .org file in the repo
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

/**
 * Fetches the .org file from GitHub
 * @returns {Promise<string>} The file content
 */
export async function fetchOrgFile() {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.raw", // Request raw content
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch Org file: ${error}`);
  }
}

/**
 * Parses the Org-mode file into a structured format
 * @param {string} content - The raw .org file content
 * @returns {Array} Array of categories with items
 */
export function parseOrgFile(content) {
  const lines = content.split("\n");
  const categories = [];
  let currentCategory = null;
  let currentParent = null; // Tracks the current level 2 parent
  let currentContext = null; // Tracks the most recent headline (level 2 or 3) for tasks

  lines.forEach((line) => {
    // Match headlines (lines starting with *)
    const headlineMatch = line.match(/^(\*+)\s+(.*)/);

    if (headlineMatch) {
      const level = headlineMatch[1].length;
      let title = headlineMatch[2].trim();

      if (level === 1) {
        // Level 1 headline: new category
        currentCategory = { title, items: [] };
        if (!title.includes(":toc:")) {
          categories.push(currentCategory);
        }
        currentParent = null; // Reset parent when a new category starts
        currentContext = null; // Reset context
      } else if (level === 2 && currentCategory) {
        // Level 2 headline: new parent under the current category
        const item = {
          title,
          type: "title", // This is a parent title
          timestamp: null,
          completionPercentage: null,
          amount: null,
          tags: [],
          tasks: [], // To hold list items like - [ ] Task
          priority: null,
          children: [], // To hold child headlines (level 3+)
        };

        // Extract TODO keyword
        const todoMatch = title.match(/^(TODO|DONE|DAILY|WEEKLY|ODDT)\s+(.*)/);
        if (todoMatch) {
          item.type = todoMatch[1].toLowerCase();
          title = todoMatch[2];
        }

        // Extract priority (e.g., [#A])
        const priorityMatch = title.match(/\[\#([A-C])\]/);
        if (priorityMatch) {
          item.priority = priorityMatch[1];
          title = title.replace(priorityMatch[0], "").trim();
        }

        // Extract completion stats (e.g., [50%] or [1/2])
        const percentMatch = title.match(/\[(\d+)%\]/);
        if (percentMatch) {
          item.completionPercentage = percentMatch[1];
          title = title.replace(percentMatch[0], "").trim();
        }
        const amountMatch = title.match(/\[(\d+\/\d+)\]/);
        if (amountMatch) {
          item.amount = amountMatch[1];
          title = title.replace(amountMatch[0], "").trim();
        }

        // Extract tags (e.g., :daily:work:)
        const tagsMatch = title.match(/:(.+):$/);
        if (tagsMatch) {
          item.tags = tagsMatch[1].split(":");
          title = title.replace(tagsMatch[0], "").trim();
        }

        item.title = title;
        currentCategory.items.push(item);
        currentParent = item; // Set this as the current parent
        currentContext = item; // Set as the current context for tasks
      } else if (level === 3 && currentParent) {
        // Level 3 headline: child item under the current parent
        const childItem = {
          title,
          type: "child",
          timestamp: null,
          completionPercentage: null,
          amount: null,
          tags: [],
          tasks: [],
          priority: null,
        };

        // Extract TODO keyword
        const todoMatch = title.match(/^(TODO|DONE|DAILY|WEEKLY|ODDT)\s+(.*)/);
        if (todoMatch) {
          childItem.type = todoMatch[1].toLowerCase();
          title = todoMatch[2];
        }

        // Extract priority (e.g., [#A])
        const priorityMatch = title.match(/\[\#([A-C])\]/);
        if (priorityMatch) {
          childItem.priority = priorityMatch[1];
          title = title.replace(priorityMatch[0], "").trim();
        }

        // Extract completion stats (e.g., [50%] or [1/2])
        const percentMatch = title.match(/\[(\d+)%\]/);
        if (percentMatch) {
          childItem.completionPercentage = percentMatch[1];
          title = title.replace(percentMatch[0], "").trim();
        }
        const amountMatch = title.match(/\[(\d+\/\d+)\]/);
        if (amountMatch) {
          childItem.amount = amountMatch[1];
          title = title.replace(amountMatch[0], "").trim();
        }

        // Extract tags (e.g., :daily:work:)
        const tagsMatch = title.match(/:(.+):$/);
        if (tagsMatch) {
          childItem.tags = tagsMatch[1].split(":");
          title = title.replace(tagsMatch[0], "").trim();
        }

        childItem.title = title;
        currentParent.children.push(childItem);
        currentContext = childItem; // Update context to this child for tasks
      }
    } else if (currentContext) {
      // Handle non-headline lines under the current context (parent or child)
      const listItemMatch = line.match(/^\s*- \[( |X)\]\s+(.*)/);
      if (listItemMatch) {
        const isChecked = listItemMatch[1] === "X";
        const taskTitle = listItemMatch[2].trim();
        // Add the task to the current context's tasks (could be parent or child)
        currentContext.tasks.push({ title: taskTitle, isChecked });
      } else {
        // Check for timestamps under the current context
        const timestampMatch = line.match(
          /<(\d{4}-\d{2}-\d{2} \w{3}[.,]?(?: (\d{2}:\d{2}(-\d{2}:\d{2})?))?(?: (\+\d+[dwmy]))?)>/,
        );
        if (timestampMatch) {
          currentContext.timestamp = timestampMatch[1];
        }
      }
    }
  });

  return categories;
}
