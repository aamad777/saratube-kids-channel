import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminGearButton() {
  return (
    <Link
      to="/admin-media"
      title="Parent Admin"
      style={{
        position: "fixed",
        top: "90px",
        right: "22px",
        zIndex: 9999,
        width: "54px",
        height: "54px",
        borderRadius: "999px",
        background: "linear-gradient(135deg, #9333ea, #ec4899)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
        border: "3px solid white",
        textDecoration: "none"
      }}
    >
      <Settings size={28} />
    </Link>
  );
}
