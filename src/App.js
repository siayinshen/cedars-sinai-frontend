import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";

// Redux
import { Provider } from "react-redux";
import store from "./redux/store";
import { SET_AUTHENTICATED } from "./redux/types";
import { logoutUser, getUserData } from "./redux/actions/userActions";

// Styles
import "./App.css";
import "./css/text.css";
import { Layout } from "antd";

// Utils
//import themeObject from "./util/configs/theme";
import AuthRoute from "./util/jsx/AuthRoute";
import axios from "axios";

// Pages
import SideNav from "./components/layout/sideNav";
import genPage from "./pages/genPage";
import login from "./pages/login";
import logout from "./pages/logout";
import announcementPage from "./pages/announcementPage";
import contactPage from "./pages/contactPage";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://fir-db-d2d47.web.app/api";
// "http://localhost:5000/api";

// Authentication
// const token = localStorage.FBIdToken;
// if (token) {
//   const decodedToken = new JWT(token).parse.payload;
//   if (decodedToken.exp * 1000 < Date.now()) {
//     store.dispatch(logoutUser());
//   } else {
//     store.dispatch({ type: SET_AUTHENTICATED });
//     axios.defaults.headers.common["Authorization"] = token;
//     store.dispatch(getUserData());
//   }
// }

const hasValidCookie = localStorage.hasValidCookie;
if (hasValidCookie) {
  try {
    console.log(localStorage.hasValidCookie);
    store.dispatch({ type: SET_AUTHENTICATED });
    store.dispatch(getUserData());
  } catch (err) {
    store.dispatch(logoutUser());
    console.log(err);
  }
} else {
  store.dispatch(logoutUser());
}

class App extends Component {
  render() {
    if (store.getState().user.authenticated) {
      return (
        <Provider store={store}>
          <Router>
            <Layout style={{ minHeight: "100vh" }}>
              <SideNav location={this.props.location} />
              <Layout className="site-layout">
                <Switch>
                  <AuthRoute exact path="/login" component={login} />
                  <Route exact path="/">
                    <Redirect to="/announcements" />
                  </Route>
                  <Route
                    exact
                    path="/announcements"
                    component={announcementPage}
                  />
                  <Route exact path="/resources" component={genPage} />
                  <Route exact path="/calendar" component={announcementPage} />
                  <Route exact path="/contacts" component={contactPage} />
                  <Route exact path="/logout" component={logout} />
                  <Route path="/resources/:pageName" component={genPage} />
                </Switch>
              </Layout>
            </Layout>
          </Router>
        </Provider>
      );
    } else {
      return (
        <Provider store={store}>
          <Router>
            <Route component={login} />
          </Router>
        </Provider>
      );
    }
  }
}

export default App;
