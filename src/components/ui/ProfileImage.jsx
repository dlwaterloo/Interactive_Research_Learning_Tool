import { User } from 'lucide-react';

const ProfileImage = ({ size = 40 }) => (
  <div className={`rounded-full bg-white/20 p-1 cursor-pointer hover:scale-105 transition-transform`} style={{ width: size, height: size }}>
    <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30">
      <User size={20} className="text-indigo-600" />
    </div>
  </div>
);

export default ProfileImage;

