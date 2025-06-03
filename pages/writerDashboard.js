import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function WriterDashboard() {
  const [stories, setStories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchStories = async () => {
      const querySnapshot = await getDocs(collection(db, "stories"));
      const storyList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data()),
      }));
      setStories(storyList);
    };

    fetchStories();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📚 Your Books</h1>
        <button style={styles.addButton} onClick={() => router.push("/addStory")}>
          ➕ Add New Book
        </button>
      </div>

      <div style={styles.grid}>
        {stories.map((item) => (
          <div key={item.id} style={styles.card} onClick={() => router.push(`/writerDashboard/${item.id}`)}>
            <img
              src={item.coverImage || "/placeholder-cover.png"}
              alt={`${item.title} cover`}
              style={styles.image}
            />
            <h2 style={styles.cardTitle}>{item.title}</h2>
            <p style={styles.cardDescription}>{item.description || "No description provided."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2rem",
    margin: 0,
  },
  addButton: {
    padding: "0.5rem 1rem",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    padding: "1rem",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "0.75rem",
  },
  cardTitle: {
    fontSize: "1.2rem",
    margin: "0 0 0.5rem 0",
  },
  cardDescription: {
    fontSize: "0.95rem",
    color: "#555",
  },
};
