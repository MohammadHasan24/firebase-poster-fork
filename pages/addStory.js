import { useState } from "react";
import { db, storage } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";

export default function AddBook() {
  console.log("AddBook mounted")
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const router = useRouter();


  const handlePost = async () => {
    console.log("Uploading file:", coverFile); // already added
    console.log("About to upload...");         // before uploadBytes()
    if (!title.trim()) return;

    setIsUploading(true);

    try {
      let coverImageUrl = "";

      console.log("Uploading file:", coverFile);

      if (coverFile) {
        const uniqueFileName = `covers/${uuidv4()}`;
        const fileRef = ref(storage, uniqueFileName);
        const snapshot = await uploadBytes(fileRef, coverFile);
        console.log("Upload successful, getting download URL...");
        coverImageUrl = await getDownloadURL(snapshot.ref);
        console.log("Image URL:", coverImageUrl);
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

      router.push(`/writerDashboard/${newDocRef.id}`);

    } catch (error) {
      console.error("Error posting:", error);
      alert("Something went wrong.");
    } finally {
      setIsUploading(false);
    }
    
  };

  const handleImageChange = (e) => {
    
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      console.log("Selected file:", file);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "600px" }}>
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
          <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", borderRadius: "8px" }} />
        </div>
      )}

      <button
        onClick={(e) => {
          e.preventDefault(); // 🔥 prevent the reload
          console.log("Post button clicked!");
          handlePost();
        }}
        disabled={isUploading}
        style={{ padding: "0.5rem 1rem" }}
      >
        {isUploading ? "Uploading..." : "Post"}
      </button>
    </main>
  );
}
