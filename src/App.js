import React, { useState, useEffect, createContext } from "react";
import { Auth, Hub, graphqlOperation, API } from "aws-amplify";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { getMarket, getUser } from "./graphql/queries";
import { registerUser } from "./graphql/mutations";
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
    Hub.listen("auth", (data) => {
      const { payload } = data;

      onHubCapsule(payload);
      // console.log('A new auth event has happened: ', data.payload.data.username + ' has ' + data.payload.event);
    });
  }, []);

  const getUSerData = async () => {
    const authenticatedUser = await Auth.currentAuthenticatedUser();
    setUser((prevUser) => {
      return authenticatedUser ? authenticatedUser : prevUser;
    });
  };

  const onHubCapsule = (payload) => {
    switch (payload.event) {
      case "signIn":
        getUSerData();
        console.log("SignedIn");
        registerNewUser(payload.data);
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
  };

  const registerNewUser = async (signInData) => {
    //Look if the user exists, with getUser query
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub,
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));
    //if we can't get a user (user hasn't been registered before) then execute registerUser
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true,
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        );
        console.log(newUser);
      } catch (err) {
        console.error(`Error registering new user`, err);
      }
    }
  };

  const handleSignout = async () => {
    try {
      await Auth.signOut();
    } catch (err) {
      console.log("Error in signing out", err);
    }
  };

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

  return user ? (
    <UserContext.Provider value={{ user: user }}>
      <Router>
        <React.Fragment>
          {/* Navigation */}
          <Navbar user={user} handleSignout={handleSignout} />

          {/* Routes */}
          <div className="app-container">
            <Route exact path="/" component={HomePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/markets/:marketId">
              <MarketPage user={user} />
            </Route>
          </div>
        </React.Fragment>
      </Router>
    </UserContext.Provider>
  ) : (
    <Authenticator theme={theme} />
  );
};

export default App;
