import MingLiApp from "./pages/MingLiApp.jsx";
import Styles from "./components/layout/Styles.jsx";
import AmbientBg from "./components/layout/AmbientBg.jsx";

export default function App() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Styles />
      <AmbientBg />
      <MingLiApp />
    </div>
  );
}

