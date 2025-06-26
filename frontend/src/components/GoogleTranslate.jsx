import React, { useEffect } from 'react';
import { FaGlobe } from 'react-icons/fa';

const GoogleTranslate = () => {
  useEffect(() => {
    // Add Google Translate script
    const addScript = () => {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,am',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    // Load script if not already loaded
    if (!window.google || !window.google.translate) {
      addScript();
    } else {
      window.googleTranslateElementInit();
    }

    return () => {
      // Cleanup
      const script = document.querySelector('script[src*="translate.google.com"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="flex items-center">
      <FaGlobe className="text-gray-600 dark:text-gray-400 mr-2" />
      <div id="google_translate_element" className="google-translate-container"></div>
      
      <style jsx global>{`
        .google-translate-container .goog-te-gadget {
          font-family: inherit !important;
          font-size: 0 !important;
          /* Hide the Google logo and "Powered by" text */
          background-image: none !important;
        }
        .google-translate-container .goog-te-gadget img {
          display: none !important;
        }
        .google-translate-container .goog-te-gadget span.text-gtrans {
          display: none !important;
        }
        
        /* Further simplify the dropdown appearance */
        .google-translate-container .goog-te-gadget-simple {
          border: none !important; /* Remove border */
          background-color: transparent !important; /* Ensure transparent background */
          padding: 0 !important; /* Remove padding */
          box-shadow: none !important; /* Remove shadow */
        }
        
        .google-translate-container .goog-te-gadget-simple {
          background-color: transparent !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.375rem !important;
          padding: 0.25rem 0.5rem !important;
          font-size: 0.875rem !important;
          color: #374151 !important;
        }
        
        .dark .google-translate-container .goog-te-gadget-simple {
          border-color: #4b5563 !important;
          background-color: #374151 !important;
          color: #f3f4f6 !important;
        }
        
        .google-translate-container .goog-te-gadget-simple:hover {
          background-color: #f9fafb !important;
        }
        
        .dark .google-translate-container .goog-te-gadget-simple:hover {
          background-color: #4b5563 !important;
        }
        
        .google-translate-container .goog-te-gadget-simple .goog-te-menu-value {
          color: inherit !important;
          font-weight: 600; /* Make selected language text bolder */
          color: inherit !important; /* Inherit color from parent */
        }
        
        .google-translate-container .goog-te-gadget-simple .goog-te-menu-value span {
          color: inherit !important;
        }
        
        .google-translate-container .goog-te-gadget-simple .goog-te-menu-value span:first-child {
          display: none;
        }
        .google-translate-container .goog-te-gadget-simple .goog-te-menu-value span:last-child {
          /* This is usually the dropdown arrow or a small icon */
          display: none !important; /* Hide the dropdown arrow */
        }
        
        .goog-te-banner-frame {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        .goog-te-menu-frame {
          max-height: 400px !important;
          overflow-y: auto !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleTranslate;