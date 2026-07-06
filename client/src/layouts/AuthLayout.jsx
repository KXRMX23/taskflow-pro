import { motion } from "framer-motion";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-logo">
          📋
        </div>

        <h1>{title}</h1>

        <p>{subtitle}</p>

        {children}
      </motion.div>
    </div>
  );
}

export default AuthLayout;