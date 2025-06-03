import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function EditStory() {
  const router = useRouter();
  const { id: bookId } = router.query;

  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [bodyText, setBodyText] = useState(""); // single textarea
  const [options, setOptions] = useState([{ text: "", nextChapterId: "" }]);

  // Fetch all chapters
  useEffect(() => {
    if (!bookId) return;
    const fetchChapters = async () => {
      const chaptersRef = collection(db, "stories", bookId, "chapters");
      const snapshot = await getDocs(chaptersRef);
      const chapterList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChapters(chapterList);
    };

    fetchChapters();
  }, [bookId]);

  const handleSelectChapter = async (id) => {
    setSelectedChapterId(id);
    const chapterDoc = await getDoc(doc(db, "stories", bookId, "chapters", id));
    const chapterData = chapterDoc.data();
    setChapterTitle(chapterData.title || "");
    setBodyText((chapterData.body || [""]).join("\n\n"));
    setOptions(chapterData.options || [{ text: "", nextChapterId: "" }]);
  };

  const handleSaveChapter = async () => {
    const chapterData = {
      title: chapterTitle,
      body: bodyText.split("\n\n").map(p => p.trim()).filter(Boolean),
      options: options.slice(0, 3).filter((o) => o.text),
    };

    const chaptersRef = collection(db, "stories", bookId, "chapters");

    if (selectedChapterId) {
      await updateDoc(doc(db, "stories", bookId, "chapters", selectedChapterId), chapterData);
      setChapters((prev) =>
        prev.map((chap) =>
          chap.id === selectedChapterId ? { ...chap, ...chapterData } : chap
        )
      );
    } else {
      const newDoc = await addDoc(chaptersRef, chapterData);
      const newChapter = { id: newDoc.id, ...chapterData };
      setChapters((prev) => [...prev, newChapter]);
      setSelectedChapterId(newDoc.id);
    }

    alert("Chapter saved!");
  };

  const handleAddNewChapter = async () => {
    if (!bookId) return;

    const chaptersRef = collection(db, "stories", bookId, "chapters");
    const newDoc = await addDoc(chaptersRef, {
      title: "",
      body: [""],
      options: [{ text: "", nextChapterId: "" }],
    });

    const newChapter = {
      id: newDoc.id,
      title: "",
      body: [""],
      options: [{ text: "", nextChapterId: "" }],
    };

    setChapters((prev) => [...prev, newChapter]);
    setSelectedChapterId(newDoc.id);
    setChapterTitle("");
    setBodyText("");
    setOptions([{ text: "", nextChapterId: "" }]);
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "900px" }}>
      <h1>Edit Chapters</h1>

      <button
        onClick={handleAddNewChapter}
        style={{
          margin: "1rem 0",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#eee",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        + New Chapter
      </button>

      {/* Chapter cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        {chapters.map((chap) => (
          <div
            key={chap.id}
            onClick={() => handleSelectChapter(chap.id)}
            style={{
              border: chap.id === selectedChapterId ? "2px solid blue" : "1px solid #ccc",
              padding: "1rem",
              width: "200px",
              cursor: "pointer",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h4>{chap.title || `Untitled (${chap.id.slice(0, 6)})`}</h4>
            <p style={{ fontSize: "0.875rem", color: "#555" }}>
              {(chap.body && chap.body[0]?.slice(0, 60)) || "No content yet."}...
            </p>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
          placeholder="Chapter Title"
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />

        <h3>Chapter Body</h3>
        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Write your chapter. Use double newlines for paragraph breaks."
          style={{ width: "100%", height: "200px", marginBottom: "1rem" }}
        />
      </div>

      <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
        <h3>Options (Up to 3)</h3>
        {options.map((option, idx) => (
          <div key={idx} style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              value={option.text}
              onChange={(e) => {
                const updated = [...options];
                updated[idx].text = e.target.value;
                setOptions(updated);
              }}
              placeholder="Option text"
              style={{ width: "45%", marginRight: "1rem", padding: "0.5rem" }}
            />
            <select
              value={option.nextChapterId}
              onChange={(e) => {
                const updated = [...options];
                updated[idx].nextChapterId = e.target.value;
                setOptions(updated);
              }}
              style={{ width: "45%", padding: "0.5rem" }}
            >
              <option value="">-- Select next chapter --</option>
              {chapters.map((chap) => (
                <option key={chap.id} value={chap.id}>
                  {chap.title || `Untitled (${chap.id.slice(0, 6)})`}
                </option>
              ))}
            </select>
          </div>
        ))}
        {options.length < 3 && (
          <button
            onClick={() => setOptions([...options, { text: "", nextChapterId: "" }])}
            style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}
          >
            + Add Option
          </button>
        )}
      </div>

      <button onClick={handleSaveChapter} style={{ padding: "0.75rem 1.5rem" }}>
        Save Chapter
      </button>
    </main>
  );
}
