/* eslint-disable react/prop-types */
import ProfileInfo from "./ProfileInfo"
import { useNavigate } from "react-router-dom"
import SearchBar from "./SearchBar"
import { useState } from "react"

const Navbar = ({userInfo, onSearchNote, handleClearSearch}) => {

  const [searchQuery, setSearchQuery] = useState('')

  const navigate = useNavigate()

  const OnLogout = () => {
    localStorage.clear()
    navigate('/login')

  }

  const handleSearch = () => {
    if(searchQuery) {
      onSearchNote(searchQuery)
    }
  }

  const onClearSearch = () => {
    setSearchQuery('')
    handleClearSearch()
  }


  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <h2 className="text-xl font-medium text-black py-2">Notes</h2>

      <SearchBar value={searchQuery} onChange={({target}) => {
        setSearchQuery(target.value)
      }}
      handleSearch={handleSearch}
      onClearSearch={onClearSearch}
      />

      <ProfileInfo userInfo={userInfo} onLogout={OnLogout}/>
    </div>
  )
}

export default Navbar