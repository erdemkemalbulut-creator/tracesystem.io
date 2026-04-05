import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Auth from './pages/Auth';
import OnboardingRouter from './pages/onboarding/OnboardingRouter';
import Today from './pages/Today';
import DaySaved from './pages/DaySaved';
import DayView from './pages/DayView';
import SeasonBridge from './pages/SeasonBridge';
import Settings from './pages/Settings';
import About from './pages/About';
import WhyUseTrace from './pages/WhyUseTrace';
import WhatToExpect from './pages/WhatToExpect';
import Definitions from './pages/Definitions';
import Feedback from './pages/Feedback';
import QuietPromise from './pages/QuietPromise';
import WhyTraceExists from './pages/articles/WhyTraceExists';
import BehaviorFollowsIdentity from './pages/articles/BehaviorFollowsIdentity';
import WhyMotivationFails from './pages/articles/WhyMotivationFails';
import AvoidanceAndStakes from './pages/articles/AvoidanceAndStakes';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding/:step" element={<OnboardingRouter />} />
          <Route path="/about" element={<About />} />
          <Route path="/why" element={<WhyUseTrace />} />
          <Route path="/expect" element={<WhatToExpect />} />
          <Route path="/definition" element={<Definitions />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/quiet-promise" element={<QuietPromise />} />
          <Route path="/writing/why-trace-exists" element={<WhyTraceExists />} />
          <Route path="/writing/behavior-follows-identity" element={<BehaviorFollowsIdentity />} />
          <Route path="/writing/why-motivation-fails" element={<WhyMotivationFails />} />
          <Route path="/writing/avoidance-and-stakes" element={<AvoidanceAndStakes />} />
          <Route
            path="/today"
            element={
              <ProtectedRoute>
                <Today />
              </ProtectedRoute>
            }
          />
          <Route
            path="/day/:day/saved"
            element={
              <ProtectedRoute>
                <DaySaved />
              </ProtectedRoute>
            }
          />
          <Route
            path="/day/:day"
            element={
              <ProtectedRoute>
                <DayView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/season-bridge"
            element={
              <ProtectedRoute>
                <SeasonBridge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
