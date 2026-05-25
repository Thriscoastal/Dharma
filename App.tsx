import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { FontSizeProvider } from './src/context/FontSizeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { BookmarkProvider } from './src/context/BookmarkContext';

function App(): React.JSX.Element {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <FontSizeProvider>
          <BookmarkProvider>
            <AppNavigator />
          </BookmarkProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
