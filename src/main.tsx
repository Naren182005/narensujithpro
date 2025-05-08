import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/custom.css' // Import custom styles for larger UI components
import './styles/enhanced-ui.css' // Import enhanced UI styles for responsiveness and animations

createRoot(document.getElementById("root")!).render(<App />);
