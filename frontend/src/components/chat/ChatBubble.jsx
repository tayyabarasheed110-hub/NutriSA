export default function ChatBubble({ role, children, actions }) {
  const isUser = role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-3 text-[14px] leading-relaxed rounded-[12px] ${
          isUser
            ? "bg-[#E1F5EE] text-[#1D9E75] rounded-tr-[4px]"
            : "bg-[#F1EFE8] text-[#1A1A18] rounded-tl-[4px]"
        }`}
      >
        {children}
        {actions && <div className="flex gap-2 mt-2">{actions}</div>}
      </div>
    </div>
  );
}
