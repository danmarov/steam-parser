import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./components/pages/home";
import Login from "./components/pages/login";
import Secret from "./components/pages/secret";
import Auth from "./components/layouts/auth";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Auth.Provider>
        <Routes>
          <Route path="/" element={<Auth.Basic children={<Home />} />} />
          <Route
            path="/secret"
            element={<Auth.Private children={<Secret />} />}
          />
          <Route path="/login" element={<Auth.Public children={<Login />} />} />
        </Routes>

        <Toaster position="top-right" reverseOrder={false} />
      </Auth.Provider>
    </BrowserRouter>
  );
}

export default App;
