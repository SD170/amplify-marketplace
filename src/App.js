import React, { useState, useEffect, createContext } from "react";
import { Auth, Hub } from "aws-amplify";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import Navbar from "./components/Navbar";
import "./App.css";
import "@aws-amplify/ui/dist/style.css";

export const UserContext = createContext();

const App = (props) => {

  const [user, setUser] = useState(null);

  useEffect(() => {
      getUSerData();
      //listening to auth-changes
      Hub.listen("auth", (data)=>{
        const { payload } = data;
        
        onHubCapsule(payload);
        // console.log('A new auth event has happened: ', data.payload.data.username + ' has ' + data.payload.event);
      });

  }, []);

  const theme = {
    ...AmplifyTheme,
    sectionHeader: {
      ...AmplifyTheme.SectionHeader,
      padding: "5px",
    },
    button: {
      ...AmplifyTheme.button,
      backgroundColor: "var(--grey)",
    },
    navBar: {
      ...AmplifyTheme.navBar,
      backgroundColor: "#f9f9f9",
    },
  };
  const getUSerData = async () => {
    const authenticatedUser = await Auth.currentAuthenticatedUser();
    setUser((prevUser) => {
      return authenticatedUser ? authenticatedUser : prevUser;
    });
  };

  const onHubCapsule =  (payload) => {
    switch (payload.event) {
      case "signIn":
        getUSerData();
        console.log("SignedIn");
        break;
      case "signUp":
        console.log("SignedUp");
        break;
      case "signOut":
        // getUSerData();
        setUser(null);
        console.log("SignedOut");
        break;

      default:
        break;
    }
  }

  const handleSignout = async() =>{
    try {
      await Auth.signOut();
      
    } catch (err) {
      console.log("Error in signing out",err);
    }

  }

  

  return user ? (
    <UserContext.Provider  value={{user:user}}>
      <Router>
        <React.Fragment>
          {/* Navigation */}
          <Navbar user={user} handleSignout={handleSignout} />

          {/* Routes */}
          <div className="app-container">
            <Route exact path="/" component={HomePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/markets/:marketId"><MarketPage user={user} /></Route>
          </div>
        </React.Fragment>
      </Router>
    </UserContext.Provider>
  ) : (
    <Authenticator theme={theme} />
  );
};

export default App;
