// All project content lives here. Edit this file to add your real work.
//
// Every project below is a PLACEHOLDER. Replace the title, summary, category,
// facts and sections with your own, and set `image` to a picture in /public
// (for example image: "work/my-project.jpg", with no leading slash) to replace the generated cover.

const placeholderSections = [
  {
    heading: "Overview",
    body: "Placeholder. Describe the problem in two or three sentences: who it was for, what was not working, and what you set out to change.",
  },
  {
    heading: "Process",
    body: "Placeholder. Walk through how you got from the brief to the result: research, sketches, the options you weighed and why you chose the one you did.",
    figure: "Placeholder image. Replace with sketches, flows or work in progress.",
  },
  {
    heading: "Outcome",
    body: "Placeholder. Show the finished work and say what happened next. Only include results you can stand behind.",
    figure: "Placeholder image. Replace with the final design.",
  },
];

const placeholderFacts = [
  ["Role", "To be added"],
  ["Year", "To be added"],
  ["Type", "To be added"],
];

export const projects = [
  {
    slug: "project-one",
    title: "Project One",
    summary: "A one-line summary of the first project goes here.",
    category: "Category to be added",
    image: null,
    cover: { ground: "#18296b", lo: "#3157c8", hi: "#6f9bff", ink: "#dce8ff", pattern: "rings" },
    facts: placeholderFacts,
    sections: placeholderSections,
  },
  {
    slug: "project-two",
    title: "Project Two",
    summary: "A one-line summary of the second project goes here.",
    category: "Category to be added",
    image: null,
    cover: { ground: "#0d4034", lo: "#1f8266", hi: "#49cfa3", ink: "#d9f7ec", pattern: "waves" },
    facts: placeholderFacts,
    sections: placeholderSections,
  },
  {
    slug: "project-three",
    title: "Project Three",
    summary: "A one-line summary of the third project goes here.",
    category: "Category to be added",
    image: null,
    cover: { ground: "#5c1d31", lo: "#b03a5a", hi: "#ff8098", ink: "#ffe3e8", pattern: "bands" },
    facts: placeholderFacts,
    sections: placeholderSections,
  },
  {
    slug: "project-four",
    title: "Project Four",
    summary: "A one-line summary of the fourth project goes here.",
    category: "Category to be added",
    image: null,
    cover: { ground: "#4d340b", lo: "#a8761c", hi: "#f2b84a", ink: "#fff1d1", pattern: "drift" },
    facts: placeholderFacts,
    sections: placeholderSections,
  },
];

// Placeholder list for the "What I work on" section. Replace with your own.
export const disciplines = ["Interface design", "Visual identity", "Motion", "Prototyping"];
