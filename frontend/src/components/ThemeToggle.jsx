//src\components\ThemeToggle.jsx
import { useDispatch, useSelector } from 'react-redux';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { toggleTheme } from '../store';
import { motion } from 'framer-motion';

function ThemeToggle() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => dispatch(toggleTheme())}
      className={`fixed top-4 right-4 p-2 rounded-full ${
        darkMode 
          ? 'bg-gray-800 text-yellow-400' 
          : 'bg-white text-gray-800'
      } shadow-lg z-50`}
    >
      {darkMode ? (
        <SunIcon className="w-6 h-6" />
      ) : (
        <MoonIcon className="w-6 h-6" />
      )}
    </motion.button>
  );
}

export default ThemeToggle;