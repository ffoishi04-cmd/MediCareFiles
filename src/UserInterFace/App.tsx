import { RouterProvider } from "react-router";
import { router } from "../routes";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";

function App() {
  return (
    <AuthProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <RouterProvider router={router} />
      </motion.div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            border: '2px solid #10b981',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
