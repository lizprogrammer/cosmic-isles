export default function HomePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "sans-serif",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Cosmic Isles
      </h1>

      <p style={{ opacity: 0.8, marginBottom: "2rem" }}>
        Begin your adventure
      </p>

      <a
        href="/game"
        style={{
          padding: "0.75rem 1.5rem",
          background: "#4f46e5",
          borderRadius: "8px",
          color: "#fff",
          textDecoration: "none",
          fontWeight: "bold"
        }}
      >
        Play Game
      </a>
    </main>
  )
}
