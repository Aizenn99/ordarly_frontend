import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { LuImage, LuX } from "react-icons/lu";

const EmojiPickerPopup = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 text-primary rounded-lg">
          {icon ? (
            <img src={icon} alt="emoji" className="w-8 h-8" />
          ) : (
            <LuImage />
          )}
        </div>
        <p>{icon ? "Change Icon" : "Pick Icon"}</p>
      </div>

      {/* Popup Overlay for md and lg screens */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="hidden md:flex fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Centered Picker */}
          <div className="hidden md:flex fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-lg">
            <button
              className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full z-50 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <LuX />
            </button>
            <EmojiPicker
              open={isOpen}
              onEmojiClick={(emojiData) => {
                onSelect(emojiData.imageUrl);
                setIsOpen(false);
              }}
            />
          </div>

          {/* Inline Picker for small screens */}
          <div className="md:hidden relative z-30">
            <button
              className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute -top-2 -right-2 z-10 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <LuX />
            </button>
            <EmojiPicker
              open={isOpen}
              onEmojiClick={(emojiData) => {
                onSelect(emojiData.imageUrl);
                setIsOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPickerPopup;
