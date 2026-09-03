import React, { useContext, useState } from "react";
import InputField from "./InputField";
import { AuthContext } from "../api/context/AuthContext";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(AuthContext);

  return (
    <div className="rounded-xl  flex justify-between items-center p-4 border-b border-b-purple-500">
      <InputField
        type="text"
        name="name"
        value={searchQuery}
        onChange={() => setSearchQuery(searchQuery)}
        placeholder="Search"
      />
      <div className="flex gap-2">
        <img
          src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZSUyMGJsYWNrfGVufDB8fDB8fHww"
          alt="profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col space-y-1 text-xs">
          <span className="font-bold">{user?.username}</span>
          <span>{user?.email}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
