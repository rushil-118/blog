import './App.scss';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Home, Login, SingleBlog, Register, Dashboard, PostEditor, NotFound} from "./pages";
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
    <Navbar />
    <Sidebar />
      <Routes>
        <Route path = "/" element = {<Home />} />
        <Route path = "/blog/:idOrSlug" element = {<SingleBlog />} />
        <Route path = "/login" element = {<Login />} />
        <Route path = "/register" element = {<Register />} />
        <Route path = "/dashboard" element = {<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path = "/posts/new" element = {<ProtectedRoute><PostEditor /></ProtectedRoute>} />
        <Route path = "/posts/:id/edit" element = {<ProtectedRoute><PostEditor /></ProtectedRoute>} />
        <Route path = "*" element = {<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
