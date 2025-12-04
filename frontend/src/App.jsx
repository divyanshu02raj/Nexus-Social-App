//src\App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './store';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserPosts from './pages/UserPosts';
import UserFollowers from './pages/UserFollowers';
import UserFollowing from './pages/UserFollowing';

import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Trending from './pages/Trending';
import SavedPosts from './pages/SavedPosts';
import PostDetails from './pages/PostDetails';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Home />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/trending"
            element={
              <PrivateRoute>
                <Layout>
                  <Trending />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <PostDetails />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <PrivateRoute>
                <Layout>
                  <SavedPosts />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:id/posts"
            element={
              <PrivateRoute>
                <Layout>
                  <UserPosts />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:id/followers"
            element={
              <PrivateRoute>
                <Layout>
                  <UserFollowers />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:id/following"
            element={
              <PrivateRoute>
                <Layout>
                  <UserFollowing />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Layout>
                  <Messages />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="bottom-right"
          theme="colored"
          toastClassName={context =>
            context?.defaultClassName + " dark:bg-gray-800 dark:text-white"
          }
        />
      </Router>
    </Provider>
  );
}

export default App;