import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import EmailEditor from './components/EmailEditor';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCurrentView('editor');
  };

  const handlePDFGenerate = (template) => {
    setSelectedTemplate(template);
    setCurrentView('editor');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedTemplate(null);
  };

  return (
    <div className="App">
      {currentView === 'home' && (
        <HomeScreen 
          onTemplateSelect={handleTemplateSelect}
          onPDFGenerate={handlePDFGenerate}
        />
      )}
      {currentView === 'editor' && selectedTemplate && (
        <EmailEditor 
          template={selectedTemplate} 
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;
