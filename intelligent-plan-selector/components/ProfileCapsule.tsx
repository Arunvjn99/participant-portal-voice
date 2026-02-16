import React from 'react';
import { UserProfile } from '../types';

interface ProfileCapsuleProps {
  user: UserProfile;
}

export const ProfileCapsule: React.FC<ProfileCapsuleProps> = ({ user }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-bold text-slate-900">{user.name}</p>
        <p className="text-[10px] text-slate-400 font-medium">Age {user.age} • {user.salary}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
        <div className="w-full h-full bg-gradient-to-tr from-slate-300 to-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
           {user.name.charAt(0)}
        </div>
      </div>
    </div>
  );
};