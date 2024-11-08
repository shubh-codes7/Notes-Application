/* eslint-disable react/prop-types */
import { getInitials } from "../utils/helper";

const ProfileInfo = ({ userInfo, onLogout }) => {
  if (!userInfo) {
    return null; // Or you could return a loading indicator or a placeholder
  }
  return (
    <div className='flex items-center gap-3'>
      <div className='w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100'>
        {getInitials(userInfo.fullName)}
      </div>
      <div>
        <p className='text-sm font-medium'>{userInfo.fullName}</p>
        <button className='text-sm underline text-slate-700' onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfileInfo;
