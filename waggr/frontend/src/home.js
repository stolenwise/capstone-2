// Home.js
export default function Home({ currentUser }) {
  const styles = {
    linkBtn: {
      display: "inline-block",
      padding: "10px 20px",
      background: "#fff",
      color: "#000",
      textDecoration: "none",
      borderRadius: "20px",
      fontWeight: "bold"
    },
    empty: {
      // Add any styles you want for the empty div here
      // For example:
      // height: "20px"
    }
  };

  return (
    <div className="Home">
      {currentUser ? (
        <div>
          <h2>Welcome back, {currentUser.firstName || currentUser.username}!</h2>
          <p>It's a beautiful day to walk a dog.🐕☀️</p>
          <p><a href="/dogs" style={styles.linkBtn}>Let's get waggin'!</a></p>
          <div style={styles.empty}></div>
        </div>
      ) : (
        <>
          <h2>Welcome to Waggr</h2>
          <p>Please log in or sign up to start browsing.</p>
        </>
      )}
    </div>
  );
}