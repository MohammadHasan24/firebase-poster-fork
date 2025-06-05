import { useState } from "react";
import { db, storage } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }

  const router = useRouter();

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handlePost = async () => {
    if (!title.trim()) {
      showNotification("error", "Title is required.");
      return;
    }

    setIsUploading(true);

    try {
      let coverImageUrl = "";

      if (coverFile) {
        const uniqueFileName = `covers/${uuidv4()}`;
        const fileRef = ref(storage, uniqueFileName);
        const snapshot = await uploadBytes(fileRef, coverFile);
        coverImageUrl = await getDownloadURL(snapshot.ref);
      }

      const newDocRef = await addDoc(collection(db, "stories"), {
        title,
        description,
        tags: tag ? [tag] : [],
        chapters: [],
        coverImage: coverImageUrl,
        published: false,
        createdAt: serverTimestamp(),
      });

      showNotification("success", "Uploaded!");
      setTimeout(() => router.push(`/writerDashboard/${newDocRef.id}`), 1000);

    } catch (error) {
      console.error("Error posting:", error);
      showNotification("error", `Failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      {notification && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            color: notification.type === "success" ? "#155724" : "#721c24",
            backgroundColor: notification.type === "success" ? "#d4edda" : "#f8d7da",
            border: `1px solid ${notification.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {notification.message}
        </div>
      )}

      <h1>Add a New Book</h1>

      <input
        type="text"
        value={title}
        placeholder="Title"
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
      />

      <input
        type="text"
        value={description}
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
        style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
      />

      <select
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
      >
        <option value="">Select a genre</option>
        <option value="horror">Horror</option>
        <option value="drama">Drama</option>
        <option value="romance">Romance</option>
        <option value="sci-fi">Sci-Fi</option>
        <option value="fantasy">Fantasy</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ marginBottom: "1rem" }}
      />

      {previewUrl && (
        <div style={{ marginBottom: "1rem" }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: "100%", borderRadius: "8px" }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            handlePost();
          }}
          disabled={isUploading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isUploading ? "not-allowed" : "pointer",
          }}
        >
          {isUploading ? "Uploading..." : "Post"}
        </button>

        <button
          onClick={() => router.push("/writerDashboard")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    </main>
  );
}
