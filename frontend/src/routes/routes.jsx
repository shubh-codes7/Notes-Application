import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'

const routes = (
    <Router>
      <Routes>
        {/* <Route path='/' element = 'go to /dashboard' /> */}
        <Route path='/' element = {<Home/>} />
        <Route path='/login' element = {<Login/>} />
        <Route path='/signup' element = {<SignUp/>} />
        {/* <Route path='*' element = "404 page not found" /> */}
      </Routes>
    </Router>
  )

export default routes
