// Home.js
export default function Home({ currentUser }) {
    return (
      <div className="Home">
        {currentUser ? (
          <h2>Welcome back{currentUser.firstName || currentUser.username}!
           <p> It's a beautiful day to walk a dog.🐕☀️ </p>
           <p> Let's get waggin'! </p>
           </h2>
         
        ) : (
          <>
            <h2>Welcome to Waggr</h2>
            <p>Please log in or sign up to start browsing.</p>
          </>
        )}
      </div>
    );
  }

  
  